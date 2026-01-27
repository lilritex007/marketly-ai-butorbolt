import db from '../database/db.js';

/**
 * Get all products (with optional filtering)
 */
export function getProducts(filters = {}) {
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

  // Parse JSON fields
  return products.map(product => ({
    ...product,
    images: product.images ? JSON.parse(product.images) : [],
    in_stock: Boolean(product.in_stock),
    show_in_ai: Boolean(product.show_in_ai)
  }));
}

/**
 * Get product by ID
 */
export function getProductById(id) {
  const stmt = db.prepare('SELECT * FROM products WHERE id = ?');
  const product = stmt.get(id);
  
  if (!product) return null;

  return {
    ...product,
    images: product.images ? JSON.parse(product.images) : [],
    in_stock: Boolean(product.in_stock),
    show_in_ai: Boolean(product.show_in_ai)
  };
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
 * Get product count
 */
export function getProductCount(filters = {}) {
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

  if (inStock !== undefined) {
    query += ' AND in_stock = ?';
    params.push(inStock ? 1 : 0);
  }

  const stmt = db.prepare(query);
  const result = stmt.get(...params);
  return result.count;
}

/**
 * Get all categories
 */
export function getCategories() {
  const stmt = db.prepare('SELECT * FROM categories ORDER BY name');
  return stmt.all().map(cat => ({
    ...cat,
    enabled: Boolean(cat.enabled)
  }));
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
 * Get statistics
 */
export function getStatistics() {
  try {
    const totalProducts = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const activeProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE show_in_ai = 1').get().count;
    const inStockProducts = db.prepare('SELECT COUNT(*) as count FROM products WHERE in_stock = 1').get().count;
    const categoriesCount = db.prepare("SELECT COUNT(DISTINCT category) as count FROM products WHERE category IS NOT NULL AND category != ''").get().count;
    
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
    throw error;
  }
}
