import fetch from 'node-fetch';
import db from '../database/db.js';
import { parseUnasData } from '../transformers/unasParser.js';
import { upsertProduct, upsertCategory } from './productService.js';

/**
 * Sync products from UNAS API with category filtering
 */
export async function syncProductsFromUnas(options = {}) {
  const {
    forceRefresh = false,
    categories = null // null = all, or array of category names
  } = options;

  // Create sync history record
  const syncStmt = db.prepare(`
    INSERT INTO sync_history (status) VALUES ('running')
  `);
  const syncResult = syncStmt.run();
  const syncId = syncResult.lastInsertRowid;

  try {
    console.log('🔄 Starting UNAS sync...');

    // Get UNAS API Key
    const apiKey = process.env.UNAS_API_KEY;
    if (!apiKey) {
      throw new Error('UNAS_API_KEY must be configured');
    }

    // STEP 1: Login to get Bearer Token
    console.log('🔐 Logging in to UNAS API...');
    
    const loginXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ApiKey>${apiKey}</ApiKey>
</Params>`;

    const loginResponse = await fetch('https://api.unas.eu/shop/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml; charset=UTF-8'
      },
      body: loginXml
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('UNAS Login Error:', errorText);
      throw new Error(`UNAS Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.text();
    console.log('📦 Parsing login response...');

    // Parse login XML to get Token
    const xml2js = await import('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false });
    const loginResult = await parser.parseStringPromise(loginData);

    if (loginResult.Error) {
      throw new Error(`UNAS Login Error: ${loginResult.Error}`);
    }

    // UNAS returns <Login><Token>...</Token></Login>
    const token = loginResult.Login?.Token || 
                  loginResult.Token || 
                  loginResult.Response?.Token;
    
    if (!token) {
      console.error('❌ No token found. Full response:', JSON.stringify(loginResult, null, 2));
      throw new Error('No token received from UNAS login. Check API Key.');
    }

    console.log('✅ Login successful, token received');

    // STEP 2: Fetch ALL products in batches (NO StatusBase = ALL products including inactive)
    console.log('📡 Fetching ALL products from UNAS (active + inactive)...');
    console.log('🎯 Target: ~160-170K products');
    
    let allProducts = [];
    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;
    let batchCount = 0;
    
    while (hasMore) {
      batchCount++;
      console.log(`📦 Batch ${batchCount}: Fetching products ${offset}-${offset + batchSize}...`);
      
      // NO StatusBase filter = ALL products (active + inactive)
      const productXml = `<?xml version="1.0" encoding="UTF-8"?>
<Params>
    <ContentType>short</ContentType>
    <LimitNum>${batchSize}</LimitNum>
    <LimitStart>${offset}</LimitStart>
</Params>`;

      const response = await fetch('https://api.unas.eu/shop/getProduct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml; charset=UTF-8',
          'Authorization': `Bearer ${token}`
        },
        body: productXml,
        signal: AbortSignal.timeout(120000) // 2 minute timeout per batch
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('UNAS API Error Response:', errorText.substring(0, 500));
        
        // Check for rate limit
        if (errorText.includes('Too much') || errorText.includes('banned')) {
          console.error('⚠️  Rate limit reached. Stopping batch sync.');
          console.log(`✓ Downloaded ${allProducts.length} products before rate limit`);
          break;
        }
        
        throw new Error(`UNAS API returned ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type') || '';
      const rawData = await response.text();
      
      let batchProducts = await parseUnasData(rawData, contentType);
      
      if (batchProducts.length === 0) {
        console.log('✓ No more products, stopping...');
        hasMore = false;
      } else {
        console.log(`  ✓ Got ${batchProducts.length} products`);
        allProducts = allProducts.concat(batchProducts);
        offset += batchSize;
        
        // Safety limit
        if (allProducts.length >= 200000) {
          console.log('⚠️  Reached 200K safety limit');
          hasMore = false;
        }
        
        // Rate limit protection: wait 2 seconds between batches
        if (hasMore && batchProducts.length === batchSize) {
          console.log('   ⏳ Waiting 2s (rate limit protection)...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }

    let products = allProducts;
    console.log(`\n📊 Total fetched: ${products.length} products`);
    
    // DEBUG: Show first product's category
    if (products.length > 0) {
      console.log(`🔍 First product: "${products[0].name}" -> Category: "${products[0].category}"`);
    }

    // Filter by categories if specified
    let enabledCategories = null;
    if (categories && Array.isArray(categories) && categories.length > 0) {
      enabledCategories = new Set(categories);
      products = products.filter(p => enabledCategories.has(p.category));
      console.log(`🔍 Filtered to ${products.length} products in selected categories`);
    } else if (!categories) {
      // Load enabled categories from database (ONLY if categories exist)
      const categoriesStmt = db.prepare('SELECT COUNT(*) as count FROM categories');
      const catCount = categoriesStmt.get().count;
      
      if (catCount > 0) {
        // Only filter if we have categories in the database
        const enabledCatsStmt = db.prepare('SELECT name FROM categories WHERE enabled = 1');
        const dbCategories = enabledCatsStmt.all();
        if (dbCategories.length > 0) {
          enabledCategories = new Set(dbCategories.map(c => c.name));
          products = products.filter(p => enabledCategories.has(p.category));
          console.log(`🔍 Filtered to ${products.length} products in enabled categories`);
        } else {
          console.log('⚠️ No enabled categories in database - no products will be synced');
        }
      } else {
        // First sync - accept all products
        console.log('🆕 First sync - accepting all categories');
      }
    }

    // Track stats
    let added = 0;
    let updated = 0;

    // Use transaction for better performance
    const insertMany = db.transaction((products) => {
      for (const product of products) {
        try {
          const result = upsertProduct(product);
          if (result.changes > 0) {
            // Check if it was insert or update
            const existsStmt = db.prepare('SELECT id FROM products WHERE id = ?');
            const exists = existsStmt.get(product.id);
            if (exists) {
              updated++;
            } else {
              added++;
            }
          }

          // Add category to categories table
          if (product.category) {
            upsertCategory(product.category, product.category_path || product.category, true);
          }
        } catch (error) {
          console.error(`Failed to upsert product ${product.id}:`, error.message);
        }
      }
    });

    console.log('💾 Saving to database...');
    insertMany(products);

    // Update sync history
    const updateSyncStmt = db.prepare(`
      UPDATE sync_history 
      SET 
        completed_at = CURRENT_TIMESTAMP,
        status = 'completed',
        products_fetched = ?,
        products_added = ?,
        products_updated = ?
      WHERE id = ?
    `);
    updateSyncStmt.run(products.length, added, updated, syncId);

    console.log('✅ Sync completed successfully');
    console.log(`   - Fetched: ${products.length}`);
    console.log(`   - Added: ${added}`);
    console.log(`   - Updated: ${updated}`);

    return {
      success: true,
      fetched: products.length,
      added,
      updated,
      syncId
    };

  } catch (error) {
    console.error('❌ Sync failed:', error);

    // Update sync history with error
    const updateSyncStmt = db.prepare(`
      UPDATE sync_history 
      SET 
        completed_at = CURRENT_TIMESTAMP,
        status = 'failed',
        error_message = ?
      WHERE id = ?
    `);
    updateSyncStmt.run(error.message, syncId);

    return {
      success: false,
      error: error.message,
      syncId
    };
  }
}

/**
 * Get sync history
 */
export function getSyncHistory(limit = 10) {
  const stmt = db.prepare(`
    SELECT * FROM sync_history 
    ORDER BY started_at DESC 
    LIMIT ?
  `);
  return stmt.all(limit);
}

/**
 * Get last successful sync info
 */
export function getLastSyncInfo() {
  const stmt = db.prepare(`
    SELECT * FROM sync_history 
    WHERE status = 'completed'
    ORDER BY completed_at DESC 
    LIMIT 1
  `);
  return stmt.get();
}

/**
 * Check if sync is needed (based on time threshold)
 */
export function isSyncNeeded(thresholdMinutes = 60) {
  const lastSync = getLastSyncInfo();
  
  if (!lastSync) return true;

  const lastSyncTime = new Date(lastSync.completed_at).getTime();
  const now = Date.now();
  const diffMinutes = (now - lastSyncTime) / (1000 * 60);

  return diffMinutes >= thresholdMinutes;
}

/**
 * Auto-sync with throttling
 */
export async function autoSync(thresholdMinutes = 60) {
  if (isSyncNeeded(thresholdMinutes)) {
    console.log('⏰ Auto-sync triggered');
    return await syncProductsFromUnas();
  } else {
    console.log('⏭️ Sync not needed yet');
    return {
      success: true,
      skipped: true,
      message: 'Sync not needed yet'
    };
  }
}
