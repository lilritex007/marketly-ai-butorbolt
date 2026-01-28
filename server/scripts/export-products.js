/**
 * Export products from SQLite database to JSON file.
 * Safe to run as script or import; never throws.
 */

import db from '../database/db.js';
import { EXCLUDED_MAIN_CATEGORIES } from '../config/excludedCategories.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runExport() {
  try {
    const excludeCondition = EXCLUDED_MAIN_CATEGORIES.length > 0
      ? ` AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) NOT IN (${EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',')})`
      : '';
    const stmt = db.prepare(`
      SELECT id, name, price, category, images, description, link, in_stock
      FROM products WHERE show_in_ai = 1 ${excludeCondition}
      ORDER BY category, name
    `);
    const products = EXCLUDED_MAIN_CATEGORIES.length > 0 ? stmt.all(...EXCLUDED_MAIN_CATEGORIES) : stmt.all();

    const safeParseImages = (raw) => {
      if (!raw) return [];
      try {
        const p = JSON.parse(raw);
        return Array.isArray(p) ? p.slice(0, 3) : [];
      } catch { return []; }
    };
    const formattedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
      images: safeParseImages(product.images),
      description: (product.description || '').substring(0, 200),
      link: product.link || '#',
      inStock: Boolean(product.in_stock)
    }));

    const stats = {
      total: formattedProducts.length,
      categories: [...new Set(formattedProducts.map(p => p.category).filter(Boolean))].length,
      exported_at: new Date().toISOString()
    };
    const exportData = { stats, products: formattedProducts };

    const publicDir = path.join(__dirname, '../../public');
    const distDir = path.join(__dirname, '../../dist');
    [publicDir, distDir].forEach(dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); });

    const publicPath = path.join(publicDir, 'products.json');
    const distPath = path.join(distDir, 'products.json');
    fs.writeFileSync(publicPath, JSON.stringify(exportData));
    fs.writeFileSync(distPath, JSON.stringify(exportData));

    const fileSizeMB = (fs.statSync(publicPath).size / 1024 / 1024).toFixed(2);
    console.log(`✅ Exported ${formattedProducts.length} products (${fileSizeMB} MB)`);
  } catch (err) {
    console.error('Export failed:', err.message);
  }
}

runExport();
if (process.argv[1] && import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}`) {
  process.exit(0);
}
