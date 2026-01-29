import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import './database/db.js'; // Initialize database

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  getProducts,
  getProductById,
  updateProductAISettings,
  deleteProduct,
  getProductCount,
  getCategories,
  getMainCategories,
  toggleCategory,
  getStatistics
} from './services/productService.js';
import {
  syncProductsFromUnas,
  getSyncHistory,
  getLastSyncInfo,
  autoSync
} from './services/syncService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://www.marketly.hu',
    'https://marketly.hu'
  ],
  credentials: true
}));

app.use(express.json());

// Serve frontend static files from /dist folder (no caching for immediate updates)
const distPath = path.join(__dirname, '..', 'dist');
app.use('/dist', express.static(distPath, {
  maxAge: 0, // No caching
  etag: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Serve loader.js from /public folder (the script UNAS loads)
const publicPath = path.join(__dirname, '..', 'public');
app.use('/public', express.static(publicPath, {
  maxAge: 0,
  etag: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// Health check – DB elérhetőség is (Railway/monitoring)
app.get('/health', (req, res) => {
  try {
    getStatistics(); // DB read – ha nincs DB, throw
    res.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() });
  } catch (err) {
    console.error('Health check DB error:', err);
    res.status(503).json({
      status: 'degraded',
      db: 'error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// ==================== PUBLIC API ====================

/**
 * Get products (for frontend display)
 * Query params: category, search, limit, offset
 */
app.get('/api/products', async (req, res) => {
  try {
    const {
      category,
      search,
      limit,
      offset = 0
    } = req.query;

    // Auto-sync if needed (async, don't wait)
    autoSync(60).catch(err => console.error('Auto-sync error:', err));

    // No limit = load ALL products; only apply limit when explicitly set
    const limitNum = limit !== undefined && limit !== '' ? parseInt(limit, 10) : undefined;

    const products = getProducts({
      category,
      search,
      showInAI: true, // Only show products enabled for AI
      limit: limitNum,
      offset: parseInt(offset, 10) || 0
    });

    const total = getProductCount({
      category,
      showInAI: true
    });

    const lastSync = getLastSyncInfo();

    res.json({
      products,
      total,
      count: products.length,
      lastSync: lastSync?.completed_at || null
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

/**
 * Get single product by ID
 */
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = getProductById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: error.message
    });
  }
});

/**
 * Get available categories
 */
app.get('/api/categories', async (req, res) => {
  try {
    const categories = getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: error.message
    });
  }
});

/**
 * Get main categories from products (for AI shop include/exclude)
 * Query: ?limit=300 (optional, top N by product count)
 * Returns { mainCategories: [ { name, productCount }, ... ] }
 */
app.get('/api/categories/main', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    const mainCategories = getMainCategories(limit);
    res.json({ mainCategories });
  } catch (error) {
    console.error('Error fetching main categories:', error);
    res.status(500).json({
      error: 'Failed to fetch main categories',
      message: error.message
    });
  }
});

/**
 * Get statistics
 */
app.get('/api/stats', async (req, res) => {
  try {
    const stats = getStatistics();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      message: error.message
    });
  }
});

// ==================== ADMIN API ====================

/**
 * Trigger manual sync from UNAS
 */
app.post('/api/admin/sync', async (req, res) => {
  try {
    const { categories } = req.body; // Optional: array of category names
    
    console.log('📡 Manual sync triggered');
    const result = await syncProductsFromUnas({ categories });
    
    res.json(result);
  } catch (error) {
    console.error('Error syncing products:', error);
    res.status(500).json({
      error: 'Failed to sync products',
      message: error.message
    });
  }
});

/**
 * Get sync history
 */
app.get('/api/admin/sync/history', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const history = getSyncHistory(limit);
    res.json({ history });
  } catch (error) {
    console.error('Error fetching sync history:', error);
    res.status(500).json({
      error: 'Failed to fetch sync history',
      message: error.message
    });
  }
});

/**
 * Get all products (including disabled ones) for admin
 */
app.get('/api/admin/products', async (req, res) => {
  try {
    const {
      category,
      search,
      showInAI,
      limit = 100,
      offset = 0
    } = req.query;

    const filters = {
      category,
      search,
      limit: parseInt(limit),
      offset: parseInt(offset)
    };

    // Only add showInAI if explicitly provided
    if (showInAI !== undefined) {
      filters.showInAI = showInAI === 'true';
    }

    const products = getProducts(filters);
    const total = getProductCount(filters);

    res.json({
      products,
      total,
      count: products.length
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: error.message
    });
  }
});

/**
 * Update product AI settings
 */
app.patch('/api/admin/products/:id', async (req, res) => {
  try {
    const { show_in_ai, priority, custom_description } = req.body;
    
    updateProductAISettings(req.params.id, {
      show_in_ai,
      priority,
      custom_description
    });

    const updatedProduct = getProductById(req.params.id);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      error: 'Failed to update product',
      message: error.message
    });
  }
});

/**
 * Delete product
 */
app.delete('/api/admin/products/:id', async (req, res) => {
  try {
    deleteProduct(req.params.id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      error: 'Failed to delete product',
      message: error.message
    });
  }
});

/**
 * Toggle category enabled status
 */
app.patch('/api/admin/categories/:name', async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (enabled === undefined) {
      return res.status(400).json({ error: 'enabled field is required' });
    }

    toggleCategory(req.params.name, enabled);
    
    const categories = getCategories();
    res.json({ categories });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({
      error: 'Failed to update category',
      message: error.message
    });
  }
});

// ==================== LEGACY ENDPOINTS (for backward compatibility) ====================

/**
 * Legacy UNAS products endpoint (redirects to new products API)
 */
app.get('/api/unas/products', async (req, res) => {
  // Redirect to new API
  req.url = '/api/products';
  app.handle(req, res);
});

/**
 * Legacy cache endpoints
 */
app.get('/api/cache/info', async (req, res) => {
  try {
    const stats = getStatistics();
    const lastSync = getLastSyncInfo();
    
    res.json({
      hasData: stats.total_products > 0,
      productCount: stats.active_products,
      timestamp: lastSync?.completed_at || null,
      age: lastSync?.completed_at 
        ? Math.round((Date.now() - new Date(lastSync.completed_at).getTime()) / 1000)
        : null,
      ttl: 3600 // 1 hour in seconds
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/cache/clear', async (req, res) => {
  res.json({ 
    message: 'Cache clearing not needed with database storage. Use /api/admin/sync to refresh data.',
    timestamp: new Date().toISOString() 
  });
});

// Global error handler – kezezetlen hibák ne döntsék le a szervert
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({ error: 'Internal server error', message: err.message });
  }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Marketly AI Bútor Shop Server running on port ${PORT}`);
  console.log(`📊 Database-backed product management enabled`);
  console.log(`🔗 UNAS API URL: ${process.env.UNAS_API_URL || 'NOT CONFIGURED'}`);
  console.log('');
  console.log('Available endpoints:');
  console.log('  Public API:');
  console.log('    GET  /api/products - Get products for display');
  console.log('    GET  /api/products/:id - Get single product');
  console.log('    GET  /api/categories - Get available categories');
  console.log('    GET  /api/categories/main - Get main categories (for AI shop filter)');
  console.log('    GET  /api/stats - Get statistics');
  console.log('  Admin API:');
  console.log('    POST   /api/admin/sync - Trigger UNAS sync');
  console.log('    GET    /api/admin/sync/history - Get sync history');
  console.log('    GET    /api/admin/products - Get all products (admin view)');
  console.log('    PATCH  /api/admin/products/:id - Update product settings');
  console.log('    DELETE /api/admin/products/:id - Delete product');
  console.log('    PATCH  /api/admin/categories/:name - Toggle category');
  console.log('');
  
  // Kezdeti sync induláskor (mindig lefut, threshold 0)
  setTimeout(() => {
    console.log('🔄 Running initial auto-sync on startup...');
    // Use threshold 0 to force sync on every deploy/restart
    autoSync(0).catch(err => console.error('Initial sync error:', err));
  }, 2000);

  // Opcionális időzített sync (pl. napi): SYNC_CRON_HOURS=24
  const cronHours = process.env.SYNC_CRON_HOURS ? parseInt(process.env.SYNC_CRON_HOURS, 10) : 0;
  if (cronHours > 0) {
    const intervalMs = cronHours * 60 * 60 * 1000;
    setInterval(() => {
      console.log(`🕐 Scheduled sync (every ${cronHours}h)...`);
      autoSync(0).catch(err => console.error('Scheduled sync error:', err));
    }, intervalMs);
    console.log(`📅 Scheduled sync every ${cronHours} hour(s)`);
  }

  // Opcionális export dist/products.json (backup/statikus másolat)
  setTimeout(async () => {
    try {
      const fs = await import('fs');
      const path = await import('path');
      const { spawn } = await import('child_process');
      const distPath = path.default.join(process.cwd(), 'dist', 'products.json');
      if (!fs.existsSync(distPath)) {
        spawn('node', ['server/scripts/export-products.js'], { detached: true, stdio: 'ignore' });
      }
    } catch (err) {
      console.warn('⚠️ Could not trigger export:', err.message);
    }
  }, 10000);
});
