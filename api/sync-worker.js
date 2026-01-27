/**
 * Sync Worker - Long-running sync job
 * Called by QStash (no timeout limit!)
 * Endpoint: /api/sync-worker
 */

import fetch from 'node-fetch';
import xml2js from 'xml2js';
import { getRedis, saveProductsBatch } from './redis.js';

/**
 * Login to UNAS
 */
async function getUnasToken() {
  const apiKey = process.env.UNAS_API_KEY;
  const loginXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>${apiKey}</ApiKey>
</Params>`;

  const response = await fetch('https://api.unas.eu/shop/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/xml; charset=UTF-8' },
    body: loginXml
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.status}`);
  }

  const loginData = await response.text();
  const parser = new xml2js.Parser({ explicitArray: false });
  const loginResult = await parser.parseStringPromise(loginData);

  if (loginResult.Error) {
    throw new Error(`UNAS Error: ${loginResult.Error}`);
  }

  const token = loginResult.Login?.Token || loginResult.Token;
  if (Array.isArray(token)) return token[0];
  return token;
}

/**
 * Fetch ALL products from UNAS in batches
 */
async function fetchAllProducts(token) {
  const allProducts = [];
  const batchSize = 1000; // UNAS batch size
  let offset = 0;
  let hasMore = true;

  console.log('📡 Starting UNAS product sync...');

  while (hasMore) {
    const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<Products>
  <Product>
    <Action>query</Action>
    <Lang>hu</Lang>
    <Limit>${batchSize}</Limit>
    <Offset>${offset}</Offset>
  </Product>
</Products>`;

    const response = await fetch('https://api.unas.eu/shop/getProduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8',
        'Authorization': `Bearer ${token}`
      },
      body: xmlRequest
    });

    if (!response.ok) {
      throw new Error(`getProduct failed: ${response.status}`);
    }

    const xmlData = await response.text();
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlData);

    if (result.Error) {
      throw new Error(`UNAS API Error: ${result.Error}`);
    }

    let productNodes = result.Products?.Product || [];
    if (!Array.isArray(productNodes) && productNodes.Sku) {
      productNodes = [productNodes];
    }

    if (productNodes.length === 0) {
      hasMore = false;
      break;
    }

    // Parse products
    for (const product of productNodes) {
      const images = [];
      if (product.Images?.Image) {
        const imageNodes = Array.isArray(product.Images.Image)
          ? product.Images.Image
          : [product.Images.Image];
        for (const img of imageNodes) {
          images.push({
            url: img.Url || '',
            alt: img.Alt || product.Name || ''
          });
        }
      }

      allProducts.push({
        id: product.Id || '',
        sku: product.Sku || '',
        name: product.Name || '',
        description: product.Description || '',
        price: parseFloat(product.Prices?.Price?.Gross || 0),
        currency: product.Prices?.Price?.Currency || 'HUF',
        category: product.Category?.Name || '',
        manufacturer: product.Manufacturer || '',
        stock: parseInt(product.Stock || 0),
        images: images,
        url: `https://www.marketly.hu/termek/${product.Sku || ''}`
      });
    }

    console.log(`✅ Fetched ${allProducts.length} products so far...`);
    offset += batchSize;

    // Safety check: max 200k products
    if (allProducts.length >= 200000) {
      hasMore = false;
    }
  }

  console.log(`✅ Total products fetched: ${allProducts.length}`);
  return allProducts;
}

/**
 * QStash Worker Handler
 * No timeout limit - can run for hours!
 */
export default async function handler(req, res) {
  // QStash signature verification (optional but recommended)
  // For now, skip for simplicity

  console.log('🚀 Sync worker started!');
  console.log('📊 Request method:', req.method);
  console.log('📊 Request headers:', JSON.stringify(req.headers, null, 2));

  try {
    const startTime = Date.now();
    console.log('⏰ Start time:', new Date().toISOString());

    // Check Redis connection
    console.log('🔗 Connecting to Redis...');
    const redis = getRedis();
    const pingResult = await redis.ping();
    console.log('✅ Redis connected, ping:', pingResult);

    // Get UNAS token
    console.log('🔐 Logging in to UNAS...');
    const token = await getUnasToken();
    console.log('✅ UNAS token received');

    // Fetch all products
    const products = await fetchAllProducts(token);

    // Save to Redis (batch write)
    const batchCount = await saveProductsBatch(products);

    const elapsed = Date.now() - startTime;

    res.status(200).json({
      success: true,
      productsCount: products.length,
      batches: batchCount,
      elapsed: elapsed,
      message: `Synced ${products.length} products in ${(elapsed / 1000).toFixed(1)}s`
    });

  } catch (error) {
    console.error('❌ Sync worker error:', error);
    res.status(500).json({
      error: 'Sync failed',
      message: error.message
    });
  }
}
