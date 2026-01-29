import db from '../database/db.js';
import { EXCLUDED_MAIN_CATEGORIES } from '../config/excludedCategories.js';

/**
 * Get all products (with optional filtering)
 * When showInAI is true:
 *   - Products in EXCLUDED_MAIN_CATEGORIES are filtered out
 *   - Products with price = 0 are filtered out (invalid price)
 * Out of stock products ARE included (shown with "Készlethiány" label)
 * Never throws: returns [] on error.
 */
export function getProducts(filters = {}) {
  try {
    const {
      category,
      showInAI,
      inStock,
      minPrice,
      maxPrice,
      limit,
      offset = 0,
      search
    } = filters;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (showInAI !== undefined) {
      query += ' AND show_in_ai = ?';
      params.push(showInAI ? 1 : 0);
    }

    // Exclude 0 Ft products from AI shop display (invalid price)
    if (showInAI) {
      query += ' AND price > 0';
    }

    if (showInAI && EXCLUDED_MAIN_CATEGORIES.length > 0) {
      query += ` AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) NOT IN (${EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',')})`;
      params.push(...EXCLUDED_MAIN_CATEGORIES);
    }

    // Note: inStock filter is optional - out of stock products ARE included by default
    if (inStock !== undefined) {
      query += ' AND in_stock = ?';
      params.push(inStock ? 1 : 0);
    }

    if (minPrice !== undefined) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }

    if (maxPrice !== undefined) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ? OR params LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    query += ' ORDER BY priority DESC, name ASC';

    if (limit) {
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);
    }

    const stmt = db.prepare(query);
    const products = stmt.all(...params);

    const safeParseImages = (raw) => {
      if (!raw) return [];
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    };

    return products.map(product => {
      const inStockVal = Boolean(product.in_stock);
      return {
        ...product,
        images: safeParseImages(product.images),
        in_stock: inStockVal,
        inStock: inStockVal,
        show_in_ai: Boolean(product.show_in_ai)
      };
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

/**
 * Get product by ID. Never throws: returns null on error.
 */
export function getProductById(id) {
  try {
    if (!id) return null;
    const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
    const product = stmt.get(id);
    if (!product) return null;

    const inStockVal = Boolean(product.in_stock);
    let images = [];
    try {
      images = product.images ? JSON.parse(product.images) : [];
      if (!Array.isArray(images)) images = [];
    } catch { images = []; }
    return {
      ...product,
      images,
      in_stock: inStockVal,
      inStock: inStockVal,
      show_in_ai: Boolean(product.show_in_ai)
    };
  } catch (error) {
    console.error('getProductById error:', error);
    return null;
  }
}

/**
 * Insert or update product
 */
export function upsertProduct(product) {
  const stmt = db.prepare(`
    INSERT INTO products (
      id, unas_id, name, price, category, category_path, images, 
      description, params, link, in_stock, show_in_ai, updated_at, last_synced_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      price = excluded.price,
      category = excluded.category,
      category_path = excluded.category_path,
      images = excluded.images,
      description = excluded.description,
      params = excluded.params,
      link = excluded.link,
      in_stock = excluded.in_stock,
      show_in_ai = COALESCE(excluded.show_in_ai, 1),
      updated_at = CURRENT_TIMESTAMP,
      last_synced_at = CURRENT_TIMESTAMP
  `);

  const images = Array.isArray(product.images) 
    ? JSON.stringify(product.images) 
    : product.images;

  return stmt.run(
    product.id,
    product.unas_id || product.id,
    product.name,
    product.price,
    product.category,
    product.category_path || product.category,
    images,
    product.description || '',
    product.params || '',
    product.link || '#',
    product.inStock || product.in_stock ? 1 : 0
  );
}

/**
 * Update product AI settings
 */
export function updateProductAISettings(id, settings) {
  const { show_in_ai, priority, custom_description } = settings;
  
  const updates = [];
  const params = [];

  if (show_in_ai !== undefined) {
    updates.push('show_in_ai = ?');
    params.push(show_in_ai ? 1 : 0);
  }

  if (priority !== undefined) {
    updates.push('priority = ?');
    params.push(priority);
  }

  if (custom_description !== undefined) {
    updates.push('custom_description = ?');
    params.push(custom_description);
  }

  if (updates.length === 0) return;

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(id);

  const query = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
  const stmt = db.prepare(query);
  return stmt.run(...params);
}

/**
 * Delete product
 */
export function deleteProduct(id) {
  const stmt = db.prepare('DELETE FROM products WHERE id = ?');
  return stmt.run(id);
}

/**
 * Get product count. Never throws: returns 0 on error.
 */
export function getProductCount(filters = {}) {
  try {
    const { category, showInAI, inStock } = filters;

    let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (showInAI !== undefined) {
      query += ' AND show_in_ai = ?';
      params.push(showInAI ? 1 : 0);
    }

    // Exclude 0 Ft products from AI shop count
    if (showInAI) {
      query += ' AND price > 0';
    }

    if (showInAI && EXCLUDED_MAIN_CATEGORIES.length > 0) {
      query += ` AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) NOT IN (${EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',')})`;
      params.push(...EXCLUDED_MAIN_CATEGORIES);
    }

    // Note: inStock filter is optional - out of stock products ARE counted by default
    if (inStock !== undefined) {
      query += ' AND in_stock = ?';
      params.push(inStock ? 1 : 0);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params);
    return result?.count ?? 0;
  } catch (error) {
    console.error('getProductCount error:', error);
    return 0;
  }
}

/**
 * Get all categories (config table) - returns just category names for frontend
 */
export function getCategories() {
  const stmt = db.prepare('SELECT name FROM categories WHERE enabled = 1 ORDER BY name');
  return stmt.all().map(cat => cat.name).filter(Boolean);
}

/**
 * Get all categories with full details (for admin)
 */
export function getCategoriesAdmin() {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  return stmt.all().map(cat => ({
    ...cat,
    enabled: Boolean(cat.enabled)
  }));
}

/**
 * Get main categories from products:
 * - If category_path contains '|', use first segment as main category
 * - Otherwise use distinct category (leaf)
 * Optional limit: return top N by product count (default no limit)
 * Returns list of { name, productCount } for filtering AI shop
 */
export function getMainCategories(limit = null) {
  const withPathSql = `
    SELECT
      trim(substr(category_path, 1, instr(category_path, '|') - 1)) AS name,
      COUNT(*) AS productCount
    FROM products
    WHERE category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0
    GROUP BY name
    ORDER BY productCount DESC, name ASC
  `;
  let withPath = db.prepare(withPathSql + (limit != null ? ' LIMIT ?' : ''));
  withPath = limit != null ? withPath.all(parseInt(limit, 10)) : withPath.all();

  if (withPath.length > 0) {
    return withPath.map(row => ({ name: row.name, productCount: row.productCount }));
  }

  const fallbackSql = `
    SELECT category AS name, COUNT(*) AS productCount
    FROM products
    WHERE category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY productCount DESC, name ASC
  `;
  let fallback = db.prepare(fallbackSql + (limit != null ? ' LIMIT ?' : ''));
  fallback = limit != null ? fallback.all(parseInt(limit, 10)) : fallback.all();

  return fallback.map(row => ({ name: row.name, productCount: row.productCount }));
}

/**
 * Add or update category
 */
export function upsertCategory(name, categoryPath = null, enabled = true) {
  const stmt = db.prepare(`
    INSERT INTO categories (name, category_path, enabled) 
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET
      category_path = excluded.category_path,
      enabled = excluded.enabled
  `);
  
  return stmt.run(name, categoryPath, enabled ? 1 : 0);
}

/**
 * Toggle category enabled status
 */
export function toggleCategory(name, enabled) {
  const stmt = db.prepare('UPDATE categories SET enabled = ? WHERE name = ?');
  return stmt.run(enabled ? 1 : 0, name);
}

/**
 * Get statistics. Never throws: returns safe defaults on error.
 */
export function getStatistics() {
  const empty = {
    total_products: 0,
    active_products: 0,
    in_stock_products: 0,
    categories_count: 0,
    last_sync: null
  };
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get()?.count ?? 0;
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE show_in_ai = 1').get()?.count ?? 0;
    const inStockProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE in_stock = 1').get()?.count ?? 0;
    const categoriesCount = db.prepare("SELECT COUNT(DISTINCT category) as count FROM products WHERE category IS NOT NULL AND category != ''").get()?.count ?? 0;
    const lastSync = db.prepare('SELECT completed_at FROM sync_history WHERE status = ? ORDER BY completed_at DESC LIMIT 1').get('completed');

    return {
      total_products: totalProducts,
      active_products: activeProducts,
      in_stock_products: inStockProducts,
      categories_count: categoriesCount,
      last_sync: lastSync?.completed_at || null
    };
  } catch (error) {
    console.error('Error in getStatistics:', error);
    return empty;
  }
}
