/**
 * List main categories from the products database
 * Run: node server/scripts/list-main-categories.js
 * Use this to decide which categories to include/exclude in the AI shop
 */

import { getMainCategories, getStatistics } from '../services/productService.js';

const limit = parseInt(process.argv[2], 10) || 300;
const mainCategories = getMainCategories(limit);
const stats = getStatistics();

console.log('\n📂 Fő kategóriák az adatbázisban (termékszám szerint, top ' + limit + '):\n');
if (mainCategories.length === 0) {
  console.log('  (Nincs termék. Futtass egy sync-et.)\n');
  process.exit(0);
}

const totalProducts = mainCategories.reduce((sum, c) => sum + c.productCount, 0);
console.log('  Összesen ' + stats.total_products + ' termék az adatbázisban.');
console.log('  Itt a top ' + mainCategories.length + ' kategória (összesen ' + totalProducts + ' termék ezekben):\n');

mainCategories.forEach((cat, i) => {
  console.log(`  ${String(i + 1).padStart(3)}. ${cat.name.padEnd(42)} ${String(cat.productCount).padStart(6)} termék`);
});

console.log('\n💡 Teljes lista: GET /api/categories/main (limit param: ?limit=500)');
console.log('   Mondd meg, mely kategóriákat hagyjuk ki / melyek kerüljenek az AI shopba.\n');
process.exit(0);
