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
 * Fetch products from UNAS via backend proxy
 * Uses database-backed storage with optional filters
 */
export const fetchUnasProducts = async (filters = {}) => {
  try {
    const API_BASE = getApiBase();
    const params = new URLSearchParams();
    
    // Vercel serverless API uses query params directly
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    // API_BASE already includes /api, so we need /products, not /api/products
    const url = `${API_BASE}/products${params.toString() ? '?' + params.toString() : ''}`;
    console.log('🔍 Fetching products from:', url);
    console.log('🔍 API_BASE value:', API_BASE);
    
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
    return {
      products: data.products || [],
      total: data.total || 0,
      count: data.count || data.products?.length || 0,
      lastSync: data.lastSync
    };
  } catch (error) {
    console.error('Error fetching UNAS products:', error);
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
