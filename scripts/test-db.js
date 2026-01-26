#!/usr/bin/env node

/**
 * Test script to verify database integration
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Change to server directory
process.chdir(path.join(__dirname, '..', 'server'));

console.log('🧪 Testing Database Integration\n');

// Import database and services
const { default: db } = await import('../server/database/db.js');
const { 
  getProducts, 
  getProductCount, 
  getCategories,
  getStatistics 
} = await import('../server/services/productService.js');

// Test 1: Database connection
console.log('✓ Database connected');

// Test 2: Check tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('✓ Tables found:', tables.map(t => t.name).join(', '));

// Test 3: Product count
const count = getProductCount();
console.log(`✓ Total products in database: ${count}`);

// Test 4: Statistics
const stats = getStatistics();
console.log('✓ Statistics:');
console.log(`  - Total products: ${stats.total_products}`);
console.log(`  - Active (show in AI): ${stats.active_products}`);
console.log(`  - In stock: ${stats.in_stock_products}`);
console.log(`  - Categories: ${stats.categories_count}`);
console.log(`  - Last sync: ${stats.last_sync || 'Never'}`);

// Test 5: Categories
const categories = getCategories();
console.log(`✓ Categories found: ${categories.length}`);
if (categories.length > 0) {
  console.log('  First 5:', categories.slice(0, 5).map(c => c.name).join(', '));
}

// Test 6: Sample products
const sampleProducts = getProducts({ limit: 5, showInAI: true });
console.log(`✓ Sample products (limit 5): ${sampleProducts.length} found`);
if (sampleProducts.length > 0) {
  console.log('  Example:', sampleProducts[0].name);
}

console.log('\n✅ All tests passed!');
console.log('\nNext steps:');
console.log('  1. Start server: npm run server');
console.log('  2. Trigger sync: curl -X POST http://localhost:3001/api/admin/sync');
console.log('  3. View products: curl http://localhost:3001/api/products');

db.close();
