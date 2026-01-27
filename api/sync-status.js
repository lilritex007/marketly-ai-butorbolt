/**
 * Sync Status Endpoint
 * Shows current sync status from Redis
 * Endpoint: /api/sync-status
 */

import { getRedis } from './redis.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json'
};

export default async function handler(req, res) {
  Object.keys(corsHeaders).forEach(key => {
    res.setHeader(key, corsHeaders[key]);
  });

  try {
    const redis = getRedis();

    // Get sync metadata from Redis
    const count = await redis.get('products:count');
    const lastSync = await redis.get('products:lastSync');

    const status = {
      cached: count > 0,
      productsCount: count || 0,
      lastSync: lastSync ? new Date(parseInt(lastSync)).toISOString() : null,
      lastSyncAgo: lastSync 
        ? Math.floor((Date.now() - parseInt(lastSync)) / 1000 / 60) + ' minutes ago'
        : 'never'
    };

    res.status(200).json({
      success: true,
      ...status,
      message: status.cached 
        ? `Cache has ${status.productsCount} products. Last synced ${status.lastSyncAgo}.`
        : 'Cache is empty. Run /api/sync to populate.'
    });

  } catch (error) {
    console.error('❌ Status check error:', error);
    res.status(500).json({
      error: 'Status check failed',
      message: error.message
    });
  }
}
