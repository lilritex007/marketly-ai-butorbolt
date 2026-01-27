/**
 * Upstash QStash Client
 * Background job queue for long-running tasks
 */

import { Client } from '@upstash/qstash';

let qstash = null;

export function getQStash() {
  if (qstash) {
    return qstash;
  }

  // QStash integration provides QSTASH_TOKEN (not signing key for Client)
  const token = process.env.QSTASH_TOKEN;

  if (!token) {
    console.error('QStash env vars:', {
      hasToken: !!process.env.QSTASH_TOKEN,
      hasCurrentKey: !!process.env.QSTASH_CURRENT_SIGNING_KEY,
      allEnvKeys: Object.keys(process.env).filter(k => k.includes('QSTASH'))
    });
    throw new Error('QStash not configured. QSTASH_TOKEN required.');
  }

  console.log('🔗 Initializing QStash client...');
  try {
    qstash = new Client({
      token: token
    });
  } catch (error) {
    console.error('QStash Client init error:', error);
    throw new Error(`QStash Client initialization failed: ${error.message}`);
  }

  return qstash;
}

/**
 * Trigger sync job asynchronously
 */
export async function triggerSync() {
  const qstash = getQStash();
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://marketly-ai-butorbolt.vercel.app';

  // QStash publishJSON (simpler API)
  const result = await qstash.publishJSON({
    url: `${baseUrl}/api/sync-worker`,
    body: {},
    retries: 3
  });

  console.log('✅ Sync job queued:', result.messageId);
  return result;
}
