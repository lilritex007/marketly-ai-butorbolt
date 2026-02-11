import db from '../database/db.js';
import { EXCLUDED_MAIN_CATEGORIES } from '../config/excludedCategories.js';
import { getDisplayMainName, MAIN_CATEGORY_DISPLAY_ORDER } from '../config/mainCategoryGroups.js';

const applySearchTerms = (query, params, search) => {
  const terms = String(search || '')
    .split(/\s+/)
    .map(t => t.trim())
    .filter(Boolean);
  if (terms.length === 0) return { query, params };
  let nextQuery = query;
  const nextParams = [...params];
  for (const term of terms) {
    nextQuery += ' AND (name LIKE ? OR description LIKE ? OR params LIKE ? OR category LIKE ?)';
    const pattern = `%${term}%`;
    nextParams.push(pattern, pattern, pattern, pattern);
  }
  return { query: nextQuery, params: nextParams };
};

const applyMainCategoryFilter = (query, params, categoryMain) => {
  if (!categoryMain || (Array.isArray(categoryMain) && categoryMain.length === 0)) return { query, params };
  const list = Array.isArray(categoryMain) ? categoryMain : [categoryMain];
  const placeholders = list.map(() => '?').join(', ');
  const nextQuery = `${query} AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) IN (${placeholders})`;
  return { query: nextQuery, params: [...params, ...list] };
};

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
      categories,
      categoryMain,
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

    if (categoryMain && (!categories || categories.length === 0)) {
      const appliedMain = applyMainCategoryFilter(query, params, categoryMain);
      query = appliedMain.query;
      params.splice(0, params.length, ...appliedMain.params);
    } else if (Array.isArray(categories) && categories.length > 0) {
      const placeholders = categories.map(() => '?').join(', ');
      query += ` AND category IN (${placeholders})`;
      params.push(...categories);
    } else if (category) {
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
      const applied = applySearchTerms(query, params, search);
      query = applied.query;
      params.splice(0, params.length, ...applied.params);
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
        show_in_ai: Boolean(product.show_in_ai),
        stock_qty: product.stock_qty ?? null
      };
    });
  } catch (error) {
    console.error('getProducts error:', error);
    return [];
  }
}

/**
 * Get minimal product list for client-side search index.
 * Same filters as getProducts(showInAI: true), only essential fields.
 * Frissítéskor a kliens ezt újratölti – készlet (inStock) mindig naprakész.
 */
export function getProductsSearchIndex() {
  try {
    let query = `
      SELECT id, name, category, price, images, in_stock, stock_qty,
             COALESCE(description,'') AS description,
             COALESCE(params,'') AS params
      FROM products WHERE 1=1
    `;
    const params = [];
    query += ' AND show_in_ai = ? AND price > 0';
    params.push(1);
    if (EXCLUDED_MAIN_CATEGORIES.length > 0) {
      query += ` AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) NOT IN (${EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',')})`;
      params.push(...EXCLUDED_MAIN_CATEGORIES);
    }
    query += ' ORDER BY priority DESC, name ASC';

    const stmt = db.prepare(query);
    const rows = stmt.all(...params);

    const safeFirstImage = (raw) => {
      if (!raw) return null;
      try {
        const parsed = JSON.parse(raw);
        const arr = Array.isArray(parsed) ? parsed : [];
        return arr[0] || null;
      } catch { return null; }
    };

    return rows.map((row) => ({
      id: row.id,
      name: row.name || '',
      category: row.category || '',
      price: row.price || 0,
      image: safeFirstImage(row.images),
      images: safeFirstImage(row.images) ? [safeFirstImage(row.images)] : [],
      inStock: Boolean(row.in_stock),
      in_stock: Boolean(row.in_stock),
      stock_qty: row.stock_qty ?? null,
      description: (row.description || '').substring(0, 500),
      params: (row.params || '').substring(0, 300)
    }));
  } catch (error) {
    console.error('getProductsSearchIndex error:', error);
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
      show_in_ai: Boolean(product.show_in_ai),
      stock_qty: product.stock_qty ?? null
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
      description, params, link, in_stock, stock_qty, show_in_ai, updated_at, last_synced_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
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
      stock_qty = excluded.stock_qty,
      show_in_ai = COALESCE(excluded.show_in_ai, 1),
      updated_at = CURRENT_TIMESTAMP,
      last_synced_at = CURRENT_TIMESTAMP
  `);

  const images = Array.isArray(product.images) 
    ? JSON.stringify(product.images) 
    : product.images;

  const stockQty = typeof product.stock_qty === 'number'
    ? product.stock_qty
    : (typeof product.stockQty === 'number' ? product.stockQty : null);

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
    product.inStock || product.in_stock ? 1 : 0,
    stockQty
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
    const { category, categories, categoryMain, showInAI, inStock, search } = filters;

    let query = 'SELECT COUNT(*) as count FROM products WHERE 1=1';
    const params = [];

    if (categoryMain && (!categories || categories.length === 0)) {
      const appliedMain = applyMainCategoryFilter(query, params, categoryMain);
      query = appliedMain.query;
      params.splice(0, params.length, ...appliedMain.params);
    } else if (Array.isArray(categories) && categories.length > 0) {
      const placeholders = categories.map(() => '?').join(', ');
      query += ` AND category IN (${placeholders})`;
      params.push(...categories);
    } else if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (showInAI !== undefined) {
      query += ' AND show_in_ai = ?';
      params.push(showInAI ? 1 : 0);
    }

    if (showInAI) {
      query += ' AND price > 0';
    }

    if (showInAI && EXCLUDED_MAIN_CATEGORIES.length > 0) {
      query += ` AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) NOT IN (${EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',')})`;
      params.push(...EXCLUDED_MAIN_CATEGORIES);
    }

    if (search) {
      const applied = applySearchTerms(query, params, search);
      query = applied.query;
      params.splice(0, params.length, ...applied.params);
    }

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
 * Get product stats (count, price range, in stock). Never throws: returns zeros on error.
 */
export function getProductStats(filters = {}) {
  try {
    const { category, categories, categoryMain, showInAI, inStock, search } = filters;

    let query = `
      SELECT
        COUNT(*) as total,
        MIN(price) as minPrice,
        MAX(price) as maxPrice,
        AVG(price) as avgPrice,
        SUM(CASE WHEN in_stock = 1 THEN 1 ELSE 0 END) as inStockCount
      FROM products WHERE 1=1
    `;
    const params = [];

    if (categoryMain && (!categories || categories.length === 0)) {
      const appliedMain = applyMainCategoryFilter(query, params, categoryMain);
      query = appliedMain.query;
      params.splice(0, params.length, ...appliedMain.params);
    } else if (Array.isArray(categories) && categories.length > 0) {
      const placeholders = categories.map(() => '?').join(', ');
      query += ` AND category IN (${placeholders})`;
      params.push(...categories);
    } else if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (showInAI !== undefined) {
      query += ' AND show_in_ai = ?';
      params.push(showInAI ? 1 : 0);
    }

    if (showInAI) {
      query += ' AND price > 0';
    }

    if (showInAI && EXCLUDED_MAIN_CATEGORIES.length > 0) {
      query += ` AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) NOT IN (${EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',')})`;
      params.push(...EXCLUDED_MAIN_CATEGORIES);
    }

    if (search) {
      const applied = applySearchTerms(query, params, search);
      query = applied.query;
      params.splice(0, params.length, ...applied.params);
    }

    if (inStock !== undefined) {
      query += ' AND in_stock = ?';
      params.push(inStock ? 1 : 0);
    }

    const stmt = db.prepare(query);
    const result = stmt.get(...params) || {};
    return {
      total: result.total ?? 0,
      minPrice: result.minPrice ?? 0,
      maxPrice: result.maxPrice ?? 0,
      avgPrice: result.avgPrice ?? 0,
      inStockCount: result.inStockCount ?? 0
    };
  } catch (error) {
    console.error('getProductStats error:', error);
    return { total: 0, minPrice: 0, maxPrice: 0, avgPrice: 0, inStockCount: 0 };
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
 * Get category hierarchy: main categories with their subcategories (children).
 * - If category_path contains '|', first segment = main, category = leaf (child)
 * - Excludes EXCLUDED_MAIN_CATEGORIES and non-AI products
 * Returns { mainCategories: [ { name, productCount, children: [ { name, productCount } ] } ] }
 */
export function getCategoryHierarchy() {
  const placeholders = EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',');
  const withPathSql = `
    SELECT
      trim(substr(category_path, 1, instr(category_path, '|') - 1)) AS main_name,
      category AS child_name,
      COUNT(*) AS productCount
    FROM products
    WHERE show_in_ai = 1 AND price > 0
      AND category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0
      AND trim(substr(category_path, 1, instr(category_path, '|') - 1)) NOT IN (${placeholders})
    GROUP BY main_name, child_name
    ORDER BY main_name ASC, productCount DESC
  `;
  const rows = db.prepare(withPathSql).all(...EXCLUDED_MAIN_CATEGORIES);

  if (rows.length > 0) {
    const byMain = new Map();
    for (const row of rows) {
      const main = row.main_name;
      if (!byMain.has(main)) {
        byMain.set(main, { productCount: 0, children: [] });
      }
      const group = byMain.get(main);
      group.productCount += row.productCount;
      group.children.push({ name: row.child_name, productCount: row.productCount });
    }
    // Merge by display main (Bútor+Bútorok → Bútor; Otthon, Lakberendezés → Otthon és lakberendezés; stb.)
    const byDisplayMain = new Map();
    for (const [rawMain, data] of byMain.entries()) {
      const displayName = getDisplayMainName(rawMain) || rawMain;
      if (!byDisplayMain.has(displayName)) {
        byDisplayMain.set(displayName, { productCount: 0, childrenMap: new Map(), rawSegments: [] });
      }
      const group = byDisplayMain.get(displayName);
      group.productCount += data.productCount;
      if (!group.rawSegments.includes(rawMain)) group.rawSegments.push(rawMain);
      for (const ch of data.children) {
        const prev = group.childrenMap.get(ch.name) || 0;
        group.childrenMap.set(ch.name, prev + (ch.productCount || 0));
      }
    }
    const orderMap = new Map(MAIN_CATEGORY_DISPLAY_ORDER.map((name, i) => [name, i]));
    const mainCategories = Array.from(byDisplayMain.entries())
      .map(([name, data]) => ({
        name,
        productCount: data.productCount,
        rawSegments: data.rawSegments,
        displayOrder: orderMap.has(name) ? orderMap.get(name) : 999,
        children: Array.from(data.childrenMap.entries())
          .map(([childName, productCount]) => ({ name: childName, productCount }))
          .sort((a, b) => (b.productCount || 0) - (a.productCount || 0))
          .slice(0, 12)
      }))
      .sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    return { mainCategories };
  }

  const fallbackSql = `
    SELECT category AS name, COUNT(*) AS productCount
    FROM products
    WHERE show_in_ai = 1 AND price > 0 AND category IS NOT NULL AND category != ''
    GROUP BY category
    ORDER BY productCount DESC
  `;
  const flat = db.prepare(fallbackSql).all();
  const mainCategories = flat
    .filter(row => !EXCLUDED_MAIN_CATEGORIES.includes(row.name))
    .map(row => ({ name: row.name, productCount: row.productCount, rawSegments: [row.name], children: [] }));
  return { mainCategories };
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
