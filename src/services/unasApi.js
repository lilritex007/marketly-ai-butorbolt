/**
 * UNAS API Service
 * Termékek kizárólag a backend API-ból (DB) – egyetlen igazságforrás.
 */

// Backend origin (apiBase lehet /api-ra végződő vagy sima URL)
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

/** Backend gyökér URL (health, stb. – nem /api alatt van) */
const getBackendOrigin = () => {
  const api = getApiBase();
  return api ? api.replace(/\/api\/?$/, '') : '';
};

/**
 * Termékek betöltése – csak backend API (DB). Nincs static JSON, mindig friss adat.
 * Never throws: hiba esetén üres tömb + error, UI ne omoljon össze.
 */
export const fetchUnasProducts = async (filters = {}) => {
  if (typeof window === 'undefined') return { products: [], total: 0, count: 0, lastSync: null, source: 'api' };

  try {
    const API_BASE = getApiBase();
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    const url = `${API_BASE}/products${params.toString() ? '?' + params.toString() : ''}`;

    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { products: [], total: 0, count: 0, lastSync: null, source: 'api', error: err.message || String(res.status) };
    }
    const data = await res.json();
    const products = (data.products || []).map(p => ({
      ...p,
      inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
    }));
    return {
      products,
      total: data.total ?? 0,
      count: data.count ?? products.length,
      lastSync: data.lastSync ?? null,
      source: 'api'
    };
  } catch (error) {
    return { products: [], total: 0, count: 0, lastSync: null, source: 'api', error: error.message };
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
 * Backend health (GET /health a gyökérön, nem /api alatt)
 */
export const checkBackendHealth = async () => {
  try {
    const origin = getBackendOrigin();
    const response = await fetch(`${origin}/health`, { method: 'GET' });
    if (!response.ok) return { status: 'error', message: `HTTP ${response.status}` };
    return await response.json();
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};
