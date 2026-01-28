/**
 * UNAS API Service
 * Handles communication with the backend proxy for UNAS product data
 */

// Use window.MARKETLY_CONFIG in production, fallback to localhost in dev
const getApiBase = () => {
  if (typeof window !== 'undefined' && window.MARKETLY_CONFIG?.apiBase) {
    return window.MARKETLY_CONFIG.apiBase;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3002';
};

/**
 * Fetch products - tries static JSON first, then falls back to API
 * This avoids API issues and CDN cache problems
 */
export const fetchUnasProducts = async (filters = {}) => {
  // Try static JSON first (from CDN - in dist folder)
  try {
    const CDN_BASE = window.MARKETLY_CONFIG?.cdnBase || 'https://cdn.jsdelivr.net/gh/lilritex007/marketly-ai-butorbolt@main/dist';
    const staticUrl = `${CDN_BASE}/products.json?v=${Date.now()}`;
    console.log('📦 Trying static JSON first:', staticUrl);
    
    // No options: any custom header triggers CORS preflight; jsDelivr blocks Content-Type on GET
    const staticResponse = await fetch(staticUrl);

    if (staticResponse.ok) {
      const staticData = await staticResponse.json();
      console.log('✅ Loaded from static JSON:', staticData.stats?.total || staticData.products?.length, 'products');
      
      // Apply filters client-side; normalize inStock for display (készlet)
      let products = (staticData.products || []).map(p => ({
        ...p,
        inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
      }));
      
      if (filters.category && filters.category !== 'Összes') {
        products = products.filter(p => p.category === filters.category);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        products = products.filter(p => 
          p.name?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        );
      }
      
      if (filters.limit) {
        products = products.slice(0, parseInt(filters.limit));
      }
      
      return {
        products,
        total: staticData.stats?.total || staticData.products?.length || 0,
        count: products.length,
        lastSync: staticData.stats?.exported_at || null,
        source: 'static'
      };
    }
  } catch (staticError) {
    console.warn('⚠️ Static JSON not available, falling back to API:', staticError.message);
  }

  // Fallback to API
  try {
    const API_BASE = getApiBase();
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `${API_BASE}/products${params.toString() ? '?' + params.toString() : ''}`;
    console.log('🔍 Falling back to API:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    // Normalize inStock (API returns in_stock; frontend expects inStock)
    const products = (data.products || []).map(p => ({
      ...p,
      inStock: p.inStock !== undefined ? p.inStock : Boolean(p.in_stock)
    }));
    return {
      products,
      total: data.total || 0,
      count: data.count || products.length || 0,
      lastSync: data.lastSync,
      source: 'api'
    };
  } catch (error) {
    console.error('❌ Error fetching from API:', error);
    throw new Error(`Failed to fetch products: ${error.message}`);
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
