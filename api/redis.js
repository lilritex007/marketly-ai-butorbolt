/**
 * Upstash Redis Client
 * Automatikusan használja a Vercel Integration environment variables-t
 * Vercel KV_ prefixet használ: KV_REST_API_URL, KV_REST_API_TOKEN
 */

import { Redis } from '@upstash/redis';

let redis = null;

export function getRedis() {
  if (redis) {
    return redis;
  }

  // Vercel integration uses KV_ prefix, Redis.fromEnv() auto-detects it
  try {
    redis = Redis.fromEnv();
    return redis;
  } catch (error) {
    // Fallback: manual config (if KV_ vars not found, try UPSTASH_)
    const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new Error('Upstash Redis not configured. Add integration in Vercel Dashboard.');
    }

    redis = new Redis({
      url,
      token
    });

    return redis;
  }
}

/**
 * Batch write products (100 per batch)
 */
export async function saveProductsBatch(products) {
  const redis = getRedis();
  const batchSize = 100;
  const batches = [];

  for (let i = 0; i < products.length; i += batchSize) {
    const batch = products.slice(i, i + batchSize);
    const batchKey = `products:batch:${Math.floor(i / batchSize)}`;
    batches.push(redis.set(batchKey, JSON.stringify(batch)));
  }

  // Save metadata
  await redis.set('products:count', products.length);
  await redis.set('products:lastSync', Date.now());

  // Save all batches in parallel
  await Promise.all(batches);

  console.log(`✅ Saved ${products.length} products in ${batches.length} batches`);
  return batches.length;
}

/**
 * Get products from cache
 */
export async function getProductsFromCache(options = {}) {
  const redis = getRedis();
  const { limit = 20, offset = 0, category, search } = options;

  // Get all batches
  const count = await redis.get('products:count');
  if (!count || count === 0) {
    return { products: [], total: 0, count: 0 };
  }

  const totalBatches = Math.ceil(count / 100);
  const batchPromises = [];

  for (let i = 0; i < totalBatches; i++) {
    batchPromises.push(redis.get(`products:batch:${i}`));
  }

  const batches = await Promise.all(batchPromises);
  let allProducts = [];

  for (const batch of batches) {
    if (batch) {
      allProducts = allProducts.concat(JSON.parse(batch));
    }
  }

  // Filter by category
  if (category) {
    allProducts = allProducts.filter(p => 
      p.category?.toLowerCase().includes(category.toLowerCase())
    );
  }

  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    allProducts = allProducts.filter(p =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.sku?.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const total = allProducts.length;
  const paginated = allProducts.slice(offset, offset + parseInt(limit));

  return {
    products: paginated,
    total,
    count: paginated.length
  };
}
