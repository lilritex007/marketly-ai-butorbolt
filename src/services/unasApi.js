/**
 * UNAS API Service
 * Handles communication with the backend proxy for UNAS product data
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Fetch products from UNAS via backend proxy
 * Uses database-backed storage with optional filters
 */
export const fetchUnasProducts = async (filters = {}) => {
  // #region agent log
  fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unasApi.js:12',message:'fetchUnasProducts called',data:{API_BASE:API_BASE,filters:filters},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H4'})}).catch(()=>{});
  // #endregion
  try {
    const params = new URLSearchParams();
    
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);
    
    const url = `${API_BASE}/api/products${params.toString() ? '?' + params.toString() : ''}`;
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unasApi.js:21',message:'Fetching from URL',data:{url:url},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unasApi.js:30',message:'Response received',data:{ok:response.ok,status:response.status},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H4'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/ce754df7-7b1e-4d67-97a6-01293e3ab261',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'unasApi.js:32',message:'Response not OK',data:{status:response.status,errorData:errorData},timestamp:Date.now(),sessionId:'debug-session',runId:'initial',hypothesisId:'H4'})}).catch(()=>{});
      // #endregion
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
    const response = await fetch(`${API_BASE}/api/admin/sync`, {
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
    const response = await fetch(`${API_BASE}/api/stats`, {
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
    const response = await fetch(`${API_BASE}/api/admin/sync`, {
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
