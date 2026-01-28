/**
 * UNAS API Service
 * Handles communication with the backend proxy for UNAS product data
 */

// Use window.MARKETLY_CONFIG in production, fallback to localhost in dev.
// Normalize so base always ends with /api (backend routes are /api/products, etc.) to avoid 404.
const getApiBase = () => {
  let base = '';
  if (typeof window !== 'undefined' && window.MARKETLY_CONFIG?.apiBase) {
    base = window.MARKETLY_CONFIG.apiBase;
  } else {
    base = import.meta.env.VITE_API_URL || 'http://localhost:3002';
  }
  base = (base || '').replace(/\/+$/, '');
  if (base && !base.endsWith('/api')) base = base + '/api';
  return base;
};

const STATIC_JSON_TIMEOUT_MS = 12000; // 12s – gyors fallback API-ra ha CDN lassú

/**
 * Fetch products - tries static JSON first (with timeout), then falls back to API.
 * Never throws: on full failure returns empty array so UI can show demo/empty state.
 */
export const fetchUnasProducts = async (filters = {}) => {
  if (typeof window === 'undefined') return { products: [], total: 0, count: 0, lastSync: null, source: null };

  const CDN_BASE = window.MARKETLY_CONFIG?.cdnBase || 'https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist';
  const staticUrl = `${CDN_BASE}/products.json?v=${Date.now()}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), STATIC_JSON_TIMEOUT_MS);
    const staticOpts = { signal: controller.signal };
    // #region agent log
    console.log('[DEBUG H5] unasApi static fetch', { hasContentType: !!(staticOpts.headers && staticOpts.headers['Content-Type']) });
    // #endregion
    const staticResponse = await fetch(staticUrl, staticOpts);
    clearTimeout(timeoutId);

    if (staticResponse.ok) {
      const staticData = await staticResponse.json();
      let products = (staticData.products || []).map(p => ({
        ...p,
        inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
      }));
      if (filters.category && filters.category !== 'Összes') products = products.filter(p => p.category === filters.category);
      if (filters.search) {
        const q = (filters.search || '').toLowerCase();
        products = products.filter(p => p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
      }
      if (filters.limit) products = products.slice(0, parseInt(filters.limit, 10) || 0);
      return {
        products,
        total: staticData.stats?.total || staticData.products?.length || 0,
        count: products.length,
        lastSync: staticData.stats?.exported_at || null,
        source: 'static'
      };
    }
  } catch (_) {
    /* timeout or CORS – fallback to API */
  }

  try {
    const API_BASE = getApiBase();
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const url = `${API_BASE}/products${params.toString() ? '?' + params.toString() : ''}`;

    // #region agent log
    console.log('[DEBUG H1] unasApi API request', { limit: filters.limit, offset: filters.offset, url });
    // #endregion

    // Do not send Content-Type on GET to avoid CORS preflight (CDN/backend may not allow it)
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { products: [], total: 0, count: 0, lastSync: null, source: 'api', error: err.message || res.status };
    }
    const data = await res.json();
    const rawLen = (data.products && data.products.length) || 0;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unasApi.js:API-response',message:'API response lengths',data:{productsLength:rawLen,total:data.total},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'H2'})}).catch(()=>{});
    // #endregion
    const products = (data.products || []).map(p => ({
      ...p,
      inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
    }));
    return {
      products,
      total: data.total || 0,
      count: data.count || products.length || 0,
      lastSync: data.lastSync || null,
      source: 'api'
    };
  } catch (error) {
    return { products: [], total: 0, count: 0, lastSync: null, source: null, error: error.message };
  }
};

/**
 * Force refresh products from UNAS (trigger sync)
 */
export const refreshUnasProducts = async () => {
  try {
    const API_BASE = getApiBase();
    // API_BASE already includes /api, so we need /admin/sync, not /api/admin/sync
    const response = await fetch(`${API_BASE}/admin/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success,
      fetched: data.fetched,
      added: data.added,
      updated: data.updated
    };
  } catch (error) {
    console.error('Error refreshing UNAS products:', error);
    throw new Error(`Failed to refresh products: ${error.message}`);
  }
};

/**
 * Get cache information from backend
 */
export const getCacheInfo = async () => {
  try {
    const API_BASE = getApiBase();
    // API_BASE already includes /api, so we need /stats, not /api/stats
    const response = await fetch(`${API_BASE}/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw new Error(`Failed to fetch stats: ${error.message}`);
  }
};

/**
 * Clear backend cache (trigger manual sync)
 */
export const clearCache = async () => {
  try {
    const API_BASE = getApiBase();
    // API_BASE already includes /api, so we need /admin/sync, not /api/admin/sync
    const response = await fetch(`${API_BASE}/admin/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error triggering sync:', error);
    throw new Error(`Failed to trigger sync: ${error.message}`);
  }
};

/**
 * Check backend health
 */
export const checkBackendHealth = async () => {
  try {
    const API_BASE = getApiBase();
    const response = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { status: 'error', message: `HTTP error! status: ${response.status}` };
    }

    return await response.json();
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};
