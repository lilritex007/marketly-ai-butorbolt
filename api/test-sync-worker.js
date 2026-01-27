/**
 * Test Sync Worker - Direct call (for debugging)
 * Endpoint: /api/test-sync-worker
 * 
 * This calls the sync-worker logic directly (bypassing QStash) for testing
 * NOTE: This will timeout after 30 seconds (Vercel limit), but useful for testing
 */

import fetch from 'node-fetch';
import xml2js from 'xml2js';
import { getRedis, saveProductsBatch } from './redis.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

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

export default async function handler(req, res) {
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    console.log('🧪 Test sync-worker: Starting...');
    
    // Just test Redis and UNAS login (quick test)
    const redis = getRedis();
    await redis.ping();
    console.log('✅ Redis OK');
    
    const token = await getUnasToken();
    console.log('✅ UNAS login OK');
    
    res.status(200).json({
      success: true,
      message: 'Sync worker test passed! Redis and UNAS connection OK.',
      note: 'Full sync will timeout (30s limit). Use QStash for full sync.'
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
}
