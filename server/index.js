import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import './database/db.js'; // Initialize database

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  getProducts,
  getProductById,
  getProductsSearchIndex,
  updateProductAISettings,
  deleteProduct,
  getProductCount,
  getProductStats,
  getCategories,
  getCategoriesAdmin,
  getMainCategories,
  getCategoryHierarchy,
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

// GZIP compression - reduces ~85MB JSON to ~8-10MB (90% smaller!)
app.use(compression({
  level: 6, // Good balance between speed and compression
  threshold: 1024, // Only compress responses > 1KB
  filter: (req, res) => {
    // Compress JSON and text responses
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
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

// Serve products.json from root path (for static product loading)
// Check both dist and public folders
app.get('/products.json', (req, res) => {
  const distFile = path.join(__dirname, '..', 'dist', 'products.json');
  const publicFile = path.join(__dirname, '..', 'public', 'products.json');
  
  // Try dist first, then public
  const filePath = fs.existsSync(distFile) ? distFile : 
                   fs.existsSync(publicFile) ? publicFile : null;
  
  if (filePath) {
    console.log(`📦 Serving products.json from: ${filePath}`);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 min cache
    res.sendFile(filePath);
  } else {
    console.error('❌ products.json not found in dist or public');
    res.status(404).json({ error: 'products.json not found' });
  }
});

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
      categories,
      categoryMain,
      search,
      limit,
      offset = 0,
      slim // If slim=true, return only essential fields (faster)
    } = req.query;
    const categoryMainList = categoryMain ? String(categoryMain).split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const categoriesList = categories ? String(categories).split(',').map(s => s.trim()).filter(Boolean) : undefined;

    // Auto-sync disabled for production cadence (nightly/manual sync only)

    // No limit = load ALL products; only apply limit when explicitly set
    const limitNum = limit !== undefined && limit !== '' ? parseInt(limit, 10) : undefined;

    let products = getProducts({
      category,
      categories: categoriesList,
      categoryMain: categoryMainList,
      search,
      showInAI: true, // Only show products enabled for AI
      limit: limitNum,
      offset: parseInt(offset, 10) || 0
    });

    // SLIM MODE: Only return essential fields for list view (much smaller payload)
    // Full product details fetched on-demand when user clicks
    if (slim === 'true' || slim === '1') {
      products = products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        image: Array.isArray(p.images) ? p.images[0] : p.images, // Only first image
        inStock: p.in_stock ?? p.inStock ?? true
      }));
    }

    const total = getProductCount({
      category,
      categories: categoriesList,
      categoryMain: categoryMainList,
      search,
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
 * Product stats (count, price range, in stock)
 * Query params: category, search
 */
app.get('/api/products/stats', async (req, res) => {
  try {
    const { category, categories, categoryMain, search } = req.query;
    const categoryMainList = categoryMain ? String(categoryMain).split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const categoriesList = categories ? String(categories).split(',').map(s => s.trim()).filter(Boolean) : undefined;
    const stats = getProductStats({
      category,
      categories: categoriesList,
      categoryMain: categoryMainList,
      search,
      showInAI: true
    });
    res.json(stats);
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({
      error: 'Failed to fetch product stats',
      message: error.message
    });
  }
});

/**
 * Keresőindex: minden termék minimális adattal (id, name, category, price, image, inStock, description, params).
 * A kliens háttérben letölti, a keresés ezen fut. Frissítés = újra letölti (készlet naprakész).
 */
app.get('/api/products/search-index', (req, res) => {
  try {
    const products = getProductsSearchIndex();
    const lastSync = getLastSyncInfo();
    res.setHeader('Cache-Control', 'private, max-age=300'); // 5 perc, majd frissíthető
    res.json({
      products,
      lastSync: lastSync?.completed_at || null
    });
  } catch (error) {
    console.error('Error fetching search index:', error);
    res.status(500).json({ error: 'Failed to fetch search index' });
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
 * Get category hierarchy (main + children) for navbar/mobile menu
 * Returns { mainCategories: [ { name, productCount, children: [ { name, productCount } ] } ] }
 */
app.get('/api/categories/hierarchy', async (req, res) => {
  try {
    const data = getCategoryHierarchy();
    res.json(data);
  } catch (error) {
    console.error('Error fetching category hierarchy:', error);
    res.status(500).json({
      error: 'Failed to fetch category hierarchy',
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

// ==================== AI API (Gemini Proxy) ====================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * AI Text Generation - Gemini Proxy
 * POST /api/ai/generate
 * Body: { prompt, temperature?, maxTokens? }
 */
app.post('/api/ai/generate', async (req, res) => {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.' 
    });
  }

  try {
    const { prompt, temperature = 0.7, maxTokens = 500 } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    console.log('[Gemini] Text generation request, prompt length:', prompt.length);

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature,
            maxOutputTokens: maxTokens,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('[Gemini] API error:', data.error || response.status);
      return res.status(response.status || 500).json({ 
        success: false, 
        error: data.error?.message || `Gemini API error: ${response.status}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('[Gemini] No text in response');
      return res.status(500).json({ success: false, error: 'No response from AI' });
    }

    console.log('[Gemini] Success, response length:', text.length);
    res.json({ success: true, text });

  } catch (error) {
    console.error('[Gemini] Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Server error: ${error.message}` 
    });
  }
});

/**
 * AI Image Analysis - Gemini Vision Proxy
 * POST /api/ai/analyze-image
 * Body: { imageBase64, mimeType, prompt }
 */
app.post('/api/ai/analyze-image', async (req, res) => {
  if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not configured');
    return res.status(500).json({ 
      success: false, 
      error: 'AI service not configured. Please add GEMINI_API_KEY to environment variables.' 
    });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg', prompt } = req.body;

    if (!imageBase64 || !prompt) {
      return res.status(400).json({ success: false, error: 'Image and prompt are required' });
    }

    console.log('[Gemini Vision] Image analysis request');

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || data.error) {
      console.error('[Gemini Vision] API error:', data.error || response.status);
      return res.status(response.status || 500).json({ 
        success: false, 
        error: data.error?.message || `Gemini API error: ${response.status}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.error('[Gemini Vision] No text in response');
      return res.status(500).json({ success: false, error: 'No response from AI' });
    }

    console.log('[Gemini Vision] Success, response length:', text.length);
    res.json({ success: true, text });

  } catch (error) {
    console.error('[Gemini Vision] Server error:', error);
    res.status(500).json({ 
      success: false, 
      error: `Server error: ${error.message}` 
    });
  }
});

/**
 * AI Health Check - Test if Gemini API is working
 * GET /api/ai/health
 */
app.get('/api/ai/health', async (req, res) => {
  if (!GEMINI_API_KEY) {
    return res.json({ 
      success: false, 
      configured: false,
      error: 'GEMINI_API_KEY not set in environment variables' 
    });
  }

  try {
    const response = await fetch(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Say hello in Hungarian, one word only.' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok || data.error) {
      return res.json({ 
        success: false, 
        configured: true,
        error: data.error?.message || `HTTP ${response.status}` 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    res.json({ 
      success: true, 
      configured: true,
      message: text || 'AI responding',
      model: 'gemini-2.0-flash'
    });

  } catch (error) {
    res.json({ 
      success: false, 
      configured: true,
      error: error.message 
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
    
    // Return full category objects for admin
    const categories = getCategoriesAdmin();
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
  console.log('    GET  /api/categories/hierarchy - Get main + children (for navbar/mobile menu)');
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
