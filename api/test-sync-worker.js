/**
 * Test Sync Worker - Direct call (for debugging)
 * Endpoint: /api/test-sync-worker
 * 
 * This calls the sync-worker directly (bypassing QStash) for testing
 */

import fetch from 'node-fetch';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'https://marketly-ai-butorbolt.vercel.app';

    console.log('🧪 Testing sync-worker directly...');
    console.log('📡 Calling:', `${baseUrl}/api/sync-worker`);

    // Call sync-worker directly
    const response = await fetch(`${baseUrl}/api/sync-worker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    
    res.status(response.status).json({
      success: response.ok,
      status: response.status,
      data: data,
      note: 'This is a direct call (bypassing QStash). Check Vercel logs for details.'
    });

  } catch (error) {
    console.error('❌ Test error:', error);
    res.status(500).json({
      error: 'Test failed',
      message: error.message
    });
  }
}
