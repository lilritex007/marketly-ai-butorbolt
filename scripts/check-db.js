import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

process.chdir(path.join(__dirname, '..', 'server'));

console.log('🔍 Checking Database Content\n');

const { default: db } = await import('../server/database/db.js');

try {
  // Check products
  const products = db.prepare('SELECT * FROM products LIMIT 5').all();
  console.log('✅ Products in database:', products.length);
  
  if (products.length > 0) {
    console.log('\nFirst product:');
    console.log(JSON.stringify(products[0], null, 2));
  }
  
  // Check if category is null
  const nullCategories = db.prepare('SELECT COUNT(*) as count FROM products WHERE category IS NULL OR category = ""').get();
  console.log('\n⚠️ Products with null/empty category:', nullCategories.count);
  
  // Check categories
  const categories = db.prepare('SELECT DISTINCT category FROM products WHERE category IS NOT NULL AND category != "" LIMIT 10').all();
  console.log('\n📂 Unique categories:', categories.length);
  categories.forEach(c => console.log('  -', c.category));
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error(error);
}

db.close();
