/**
 * Export products from SQLite database to JSON file
 * This creates a static products.json file that can be loaded directly in the frontend
 * Excludes main categories listed in config/excludedCategories.js
 */

import db from '../database/db.js';
import { EXCLUDED_MAIN_CATEGORIES } from '../config/excludedCategories.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const excludeCondition = EXCLUDED_MAIN_CATEGORIES.length > 0
  ? ` AND (CASE WHEN category_path IS NOT NULL AND category_path != '' AND instr(category_path, '|') > 0 THEN trim(substr(category_path, 1, instr(category_path, '|') - 1)) ELSE category END) NOT IN (${EXCLUDED_MAIN_CATEGORIES.map(() => '?').join(',')})`
  : '';
const stmt = db.prepare(`
  SELECT 
    id, name, price, category, 
    images, description, link, in_stock
  FROM products 
  WHERE show_in_ai = 1
  ${excludeCondition}
  ORDER BY category, name
`);

const products = EXCLUDED_MAIN_CATEGORIES.length > 0
  ? stmt.all(...EXCLUDED_MAIN_CATEGORIES)
  : stmt.all();

// Parse JSON fields and optimize
const formattedProducts = products.map(product => {
  const images = product.images ? JSON.parse(product.images) : [];
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    category: product.category,
    images: images.slice(0, 3), // Only first 3 images to reduce size
    description: product.description ? product.description.substring(0, 200) : '', // Limit description
    link: product.link || '#',
    inStock: Boolean(product.in_stock)
  };
});

// Get statistics
const stats = {
  total: formattedProducts.length,
  categories: [...new Set(formattedProducts.map(p => p.category).filter(Boolean))].length,
  exported_at: new Date().toISOString()
};

// Create export data (minified JSON - no pretty print to reduce size)
const exportData = {
  stats,
  products: formattedProducts
};

// Write to both public and dist directories
const publicDir = path.join(__dirname, '../../public');
const distDir = path.join(__dirname, '../../dist');

[publicDir, distDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Write full file to public (for Railway backend)
const publicPath = path.join(publicDir, 'products.json');
fs.writeFileSync(publicPath, JSON.stringify(exportData));

// Write to dist (for frontend build)
const distPath = path.join(distDir, 'products.json');
fs.writeFileSync(distPath, JSON.stringify(exportData));

const fileSizeMB = (fs.statSync(publicPath).size / 1024 / 1024).toFixed(2);
console.log(`✅ Exported ${formattedProducts.length} products`);
console.log(`📁 Public: ${publicPath} (${fileSizeMB} MB)`);
console.log(`📁 Dist: ${distPath} (${fileSizeMB} MB)`);
console.log(`📊 Categories: ${stats.categories}`);

if (parseFloat(fileSizeMB) > 50) {
  console.log('⚠️  File is large (>50MB). Frontend will load from CDN with cache.');
}

// Don't exit if imported as module
if (import.meta.url === `file://${process.argv[1]}`) {
  process.exit(0);
}
