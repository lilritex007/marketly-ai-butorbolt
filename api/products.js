/**
 * Vercel Serverless Function - UNAS Products API
 * Endpoint: /api/products
 */

import fetch from 'node-fetch';
import xml2js from 'xml2js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

/**
 * Login to UNAS and get Bearer Token
 */
async function getUnasToken() {
  const apiKey = process.env.UNAS_API_KEY;
  if (!apiKey) {
    throw new Error('UNAS_API_KEY not configured');
  }

  const loginXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>${apiKey}</ApiKey>
</Params>`;

  const response = await fetch('https://api.unas.eu/shop/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8'
    },
    body: loginXml
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('UNAS Login Error:', errorText);
    throw new Error(`UNAS Login failed: ${response.status}`);
  }

  const loginData = await response.text();
  const parser = new xml2js.Parser({ explicitArray: false });
  const loginResult = await parser.parseStringPromise(loginData);

  if (loginResult.Error) {
    throw new Error(`UNAS Login Error: ${loginResult.Error}`);
  }

  const token = loginResult.Login?.Token || 
                loginResult.Token || 
                loginResult.Response?.Token;
  
  if (!token) {
    console.error('No token found. Full response:', JSON.stringify(loginResult, null, 2));
    throw new Error('No token received from UNAS login');
  }

  // Handle token as array
  if (Array.isArray(token)) {
    return token[0];
  }

  return token;
}

/**
 * Fetch products from UNAS
 */
async function getProducts(token, options = {}) {
  const limit = options.limit || 100;
  const offset = options.offset || 0;
  const category = options.category || null;
  const search = options.search || null;

  let xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<Products>
  <Product>
    <Action>query</Action>
    <Lang>hu</Lang>
    <Limit>${limit}</Limit>
    <Offset>${offset}</Offset>`;

  if (category) {
    xmlRequest += `<Category><Name><![CDATA[${category}]]></Name></Category>`;
  }

  if (search) {
    xmlRequest += `<Search><![CDATA[${search}]]></Search>`;
  }

  xmlRequest += `
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
    const errorText = await response.text();
    console.error('UNAS getProduct Error:', errorText);
    throw new Error(`UNAS getProduct failed: ${response.status}`);
  }

  const xmlData = await response.text();
  return parseProducts(xmlData);
}

/**
 * Parse UNAS XML response to JSON
 */
async function parseProducts(xmlString) {
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(xmlString);

  if (result.Error) {
    throw new Error(`UNAS API Error: ${result.Error}`);
  }

  const products = [];
  let productNodes = result.Products?.Product || [];

  // Handle single product (not array)
  if (!Array.isArray(productNodes) && productNodes.Sku) {
    productNodes = [productNodes];
  }

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

    products.push({
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

  return {
    products,
    total: products.length,
    count: products.length
  };
}

/**
 * Vercel Serverless Handler
 */
export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Set CORS headers
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    const startTime = Date.now();
    
    // Get query parameters
    const {
      limit = '20',  // Csökkentett alapértelmezett limit (gyorsabb)
      offset = '0',
      category,
      search
    } = req.query;

    // Get UNAS token
    console.log('🔐 Getting UNAS token...');
    const loginStart = Date.now();
    const token = await getUnasToken();
    console.log(`✅ Token received (${Date.now() - loginStart}ms)`);

    // Fetch products
    console.log(`📡 Fetching ${limit} products...`);
    const fetchStart = Date.now();
    const result = await getProducts(token, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      category,
      search
    });
    console.log(`✅ ${result.count} products fetched (${Date.now() - fetchStart}ms)`);
    console.log(`⏱️ Total time: ${Date.now() - startTime}ms`);

    // Return JSON
    res.status(200).json(result);

  } catch (error) {
    console.error('❌ API Error:', error);
    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
