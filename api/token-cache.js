/**
 * Simple in-memory token cache
 * Token élettartam: 1 óra
 */

let cachedToken = null;
let tokenExpiry = null;

export function getCachedToken() {
  if (cachedToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('✅ Using cached token');
    return cachedToken;
  }
  return null;
}

export function setCachedToken(token) {
  cachedToken = token;
  tokenExpiry = Date.now() + (60 * 60 * 1000); // 1 óra
  console.log('💾 Token cached for 1 hour');
}

export function clearCachedToken() {
  cachedToken = null;
  tokenExpiry = null;
  console.log('🗑️ Token cache cleared');
}
