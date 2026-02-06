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
 * Tries multiple paths to find the products.json
 */
const loadStaticProducts = async () => {
  if (staticProductsCache) return staticProductsCache;
  
  // Possible paths where products.json might be
  const possiblePaths = [
    '/dist/products.json',    // Railway server serves /dist/*
    '/public/products.json',  // Railway server serves /public/*
    '/products.json',         // Direct path (dev server)
    './products.json',        // Relative path
  ];
  
  for (const path of possiblePaths) {
    try {
      console.log(`📦 Trying to load products from: ${path}`);
      const res = await fetch(path);
      if (!res.ok) continue;
      
      const data = await res.json();
      const products = Array.isArray(data) ? data : (data.products || []);
      
      if (products.length > 1000) {
        staticProductsCache = products.map(p => ({
          ...p,
          inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
        }));
        console.log(`✅ Loaded ${staticProductsCache.length.toLocaleString()} products from ${path}`);
        return staticProductsCache;
      }
    } catch (err) {
      // Try next path
      continue;
    }
  }
  
  console.error('❌ Failed to load static products from any path');
  return [];
};

/**
 * Termékek betöltése – MINDIG STATIC JSON FIRST (gyors, megbízható)
 * A statikus fájl 200k terméket tartalmaz, azonnal betölt.
 * Backend API csak frissítéskor/szűréskor kell.
 */
export const fetchUnasProducts = async (filters = {}) => {
  if (typeof window === 'undefined') return { products: [], total: 0, count: 0, lastSync: null, source: 'api' };

  // STRATEGY: Always load from static JSON first (fast, reliable, 200k products)
  // This ensures search/chat ALWAYS has products to work with
  try {
    console.log('🚀 Loading products...');
    
    // If no filters, load from static JSON (fastest path)
    const hasFilters = filters.category || filters.search;
    
    if (!hasFilters) {
      // Try static JSON first (200k products, ~65MB, cached by browser)
      const staticProducts = await loadStaticProducts();
      if (staticProducts.length > 10000) {
        console.log(`✅ Loaded ${staticProducts.length.toLocaleString()} products from static cache`);
        return {
          products: staticProducts,
          total: staticProducts.length,
          count: staticProducts.length,
          lastSync: null,
          source: 'static'
        };
      }
    }
    
    // Filtered request or static failed → try API
    const API_BASE = getApiBase();
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    // Always use slim mode for API (full data is too large)
    params.append('slim', 'true');
    const url = `${API_BASE}/products${params.toString() ? '?' + params.toString() : ''}`;

    console.log('📡 Fetching from API:', url);
    const res = await fetch(url, { method: 'GET' });
    
    if (!res.ok) {
      console.warn('⚠️ API failed, using static fallback');
      const staticProducts = await loadStaticProducts();
      return { 
        products: staticProducts, 
        total: staticProducts.length, 
        count: staticProducts.length, 
        lastSync: null, 
        source: 'static',
        fallback: true 
      };
    }
    
    const data = await res.json();
    let products = (data.products || []).map(p => ({
      ...p,
      inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
    }));
    
    console.log(`✅ API returned ${products.length.toLocaleString()} products`);
    
    // If API returned few products but we have more in static, use static
    if (products.length < 1000 && !hasFilters) {
      const staticProducts = await loadStaticProducts();
      if (staticProducts.length > products.length) {
        console.log(`📦 Using static (${staticProducts.length.toLocaleString()}) instead of API (${products.length})`);
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
      total: data.total ?? products.length,
      count: data.count ?? products.length,
      lastSync: data.lastSync ?? null,
      source: 'api'
    };
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    // Always fallback to static
    const staticProducts = await loadStaticProducts();
    if (staticProducts.length > 0) {
      console.log(`🔄 Fallback: ${staticProducts.length.toLocaleString()} products from static`);
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
 * Fetch category hierarchy (main + children) for navbar/mobile menu
 * Returns { mainCategories: [ { name, productCount, children: [ { name, productCount } ] } ] }
 */
export const fetchCategoryHierarchy = async () => {
  try {
    const API_BASE = getApiBase();
    const res = await fetch(`${API_BASE}/categories/hierarchy`);
    if (!res.ok) return { mainCategories: [] };
    const data = await res.json();
    return { mainCategories: Array.isArray(data.mainCategories) ? data.mainCategories : [] };
  } catch (error) {
    console.error('Error fetching category hierarchy:', error);
    return { mainCategories: [] };
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
