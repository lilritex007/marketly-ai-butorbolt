/**
 * Vercel Serverless Function - Products API
 * Endpoint: /api/products
 * 
 * Reads from Redis cache (fast!)
 */

import { getProductsFromCache } from './redis.js';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json'
};

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
      limit = '20',
      offset = '0',
      category,
      search
    } = req.query;

    // Get products from Redis cache (FAST!)
    console.log('📦 Fetching products from Redis cache...');
    const result = await getProductsFromCache({
      limit: parseInt(limit),
      offset: parseInt(offset),
      category,
      search
    });

    const elapsed = Date.now() - startTime;
    console.log(`✅ ${result.count} products returned (${elapsed}ms)`);

    // Return JSON
    res.status(200).json({
      ...result,
      cached: true,
      responseTime: elapsed
    });

  } catch (error) {
    console.error('❌ API Error:', error);
    
    // If Redis not configured, return helpful error
    if (error.message.includes('not configured')) {
      return res.status(503).json({
        error: 'Cache not initialized',
        message: 'Please run /api/sync first to populate the cache',
        hint: 'Visit https://marketly-ai-butorbolt.vercel.app/api/sync'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: error.message
    });
  }
}
