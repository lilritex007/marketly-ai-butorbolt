/**
 * UNAS API Service
 * API-first, kis lapméret: soha ne töltsünk 200k terméket memóriába.
 * Cél: 3 mp alatt interaktív, alacsony memória.
 */

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

const getBackendOrigin = () => {
  const api = getApiBase();
  return api ? api.replace(/\/api\/?$/, '') : '';
};

/** Első lap mérete (gyors first paint) */
const DEFAULT_LIMIT = 200;

/**
 * Termékek betöltése – MINDIG API, limit/offset.
 * Nincs teljes katalógus a kliensen; lapozás és keresés szerveren.
 */
export const fetchUnasProducts = async (filters = {}) => {
  if (typeof window === 'undefined') return { products: [], total: 0, count: 0, lastSync: null, source: 'api' };

  const limit = filters.limit != null ? Number(filters.limit) : DEFAULT_LIMIT;
  const offset = filters.offset != null ? Number(filters.offset) : 0;

  try {
    const API_BASE = getApiBase();
    const params = new URLSearchParams();
    params.set('limit', String(limit));
    params.set('offset', String(offset));
    if (filters.slim !== undefined) {
      params.set('slim', filters.slim ? 'true' : 'false');
    }
    if (filters.category && filters.category !== 'Összes') params.set('category', filters.category);
    if (filters.categoryMain) {
      const mainValue = Array.isArray(filters.categoryMain) ? filters.categoryMain.join(',') : filters.categoryMain;
      params.set('categoryMain', mainValue);
    }
    if (filters.search && String(filters.search).trim()) params.set('search', String(filters.search).trim());

    const url = `${API_BASE}/products?${params.toString()}`;
    const res = await fetch(url, { method: 'GET' });

    if (!res.ok) {
      return { products: [], total: 0, count: 0, lastSync: null, source: 'api', error: res.status };
    }

    const data = await res.json();
    const products = (data.products || []).map(p => ({
      ...p,
      images: p.images || (p.image ? [p.image] : []),
      image: p.images?.[0] || p.image,
      inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
    }));

    return {
      products,
      total: data.total ?? products.length,
      count: products.length,
      lastSync: data.lastSync ?? null,
      source: 'api'
    };
  } catch (error) {
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
 * Keresőindex: minden termék minimális adattal (gyors, gzip-pel kisebb).
 * A kereső ezen fut; frissítés = újra letölti (készlet naprakész).
 */
export const fetchSearchIndex = async () => {
  try {
    const API_BASE = getApiBase();
    const res = await fetch(`${API_BASE}/products/search-index`);
    if (!res.ok) return { products: [], lastSync: null };
    const data = await res.json();
    if (Array.isArray(data)) return { products: data, lastSync: null };
    return {
      products: Array.isArray(data.products) ? data.products : [],
      lastSync: data.lastSync || null
    };
  } catch (error) {
    return { products: [], lastSync: null };
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
 * Fetch single product by ID (full detail)
 */
export const fetchUnasProductById = async (id) => {
  try {
    const API_BASE = getApiBase();
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      ...data,
      images: data.images || (data.image ? [data.image] : []),
      image: data.images?.[0] || data.image,
      inStock: data.inStock !== undefined ? data.inStock : Boolean(data.in_stock)
    };
  } catch (error) {
    return null;
  }
};

/**
 * Product stats (counts + price range + in stock)
 */
export const fetchProductStats = async (filters = {}) => {
  try {
    const API_BASE = getApiBase();
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'Összes') params.set('category', filters.category);
    if (filters.categoryMain) {
      const mainValue = Array.isArray(filters.categoryMain) ? filters.categoryMain.join(',') : filters.categoryMain;
      params.set('categoryMain', mainValue);
    }
    if (filters.search && String(filters.search).trim()) params.set('search', String(filters.search).trim());
    const res = await fetch(`${API_BASE}/products/stats?${params.toString()}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    return null;
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
