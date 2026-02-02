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

// Static products cache (loaded once)
let staticProductsCache = null;

/**
 * Load products from static JSON file (fallback)
 */
const loadStaticProducts = async () => {
  if (staticProductsCache) return staticProductsCache;
  
  try {
    console.log('📦 Loading static products.json as fallback...');
    const res = await fetch('/products.json');
    if (!res.ok) throw new Error('Static products not found');
    const data = await res.json();
    const products = Array.isArray(data) ? data : (data.products || []);
    staticProductsCache = products.map(p => ({
      ...p,
      inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
    }));
    console.log(`✅ Loaded ${staticProductsCache.length} products from static file`);
    return staticProductsCache;
  } catch (err) {
    console.error('Failed to load static products:', err);
    return [];
  }
};

/**
 * Termékek betöltése – backend API (DB) + fallback statikus JSON-ra ha üres.
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
    if (filters.slim) params.append('slim', 'true'); // Slim mode: only essential fields
    const url = `${API_BASE}/products${params.toString() ? '?' + params.toString() : ''}`;

    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      // API failed - try static fallback
      const staticProducts = await loadStaticProducts();
      if (staticProducts.length > 0) {
        return { 
          products: staticProducts, 
          total: staticProducts.length, 
          count: staticProducts.length, 
          lastSync: null, 
          source: 'static',
          fallback: true 
        };
      }
      return { products: [], total: 0, count: 0, lastSync: null, source: 'api', error: err.message || String(res.status) };
    }
    const data = await res.json();
    let products = (data.products || []).map(p => ({
      ...p,
      inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
    }));
    
    // FALLBACK: If API returns few/no products, use static JSON
    if (products.length < 1000) {
      console.log(`⚠️ API returned only ${products.length} products, loading static fallback...`);
      const staticProducts = await loadStaticProducts();
      if (staticProducts.length > products.length) {
        console.log(`✅ Using ${staticProducts.length} products from static file`);
        return {
          products: staticProducts,
          total: staticProducts.length,
          count: staticProducts.length,
          lastSync: data.lastSync ?? null,
          source: 'static',
          fallback: true
        };
      }
    }
    
    return {
      products,
      total: data.total ?? 0,
      count: data.count ?? products.length,
      lastSync: data.lastSync ?? null,
      source: 'api'
    };
  } catch (error) {
    // Network error - try static fallback
    const staticProducts = await loadStaticProducts();
    if (staticProducts.length > 0) {
      return { 
        products: staticProducts, 
        total: staticProducts.length, 
        count: staticProducts.length, 
        lastSync: null, 
        source: 'static',
        fallback: true 
      };
    }
    return { products: [], total: 0, count: 0, lastSync: null, source: 'api', error: error.message };
  }
};

/**
 * Fetch categories from backend
 */
export const fetchCategories = async () => {
  try {
    const API_BASE = getApiBase();
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) return ['Összes'];
    const data = await res.json();
    // Backend returns category objects, extract just the names
    const categoryNames = (data.categories || [])
      .map(cat => typeof cat === 'string' ? cat : cat.name)
      .filter(Boolean)
      .sort();
    return ['Összes', ...categoryNames];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ['Összes'];
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
