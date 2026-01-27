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

  const url = process.env.QSTASH_URL;
  const token = process.env.QSTASH_CURRENT_SIGNING_KEY;

  if (!url || !token) {
    throw new Error('QStash not configured. Add integration in Vercel Dashboard.');
  }

  qstash = new Client({
    token
  });

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

  const result = await qstash.publishJSON({
    url: `${baseUrl}/api/sync-worker`,
    method: 'POST',
    body: {},
    // Retry 3 times if fails
    retries: 3,
    // No timeout (can run for hours)
    notBefore: 0
  });

  console.log('✅ Sync job queued:', result.messageId);
  return result;
}
