import Database from 'better-sqlite3';

const db = new Database('data/products.db');

const all = db.prepare('SELECT category, COUNT(*) as cnt FROM products GROUP BY category ORDER BY cnt DESC').all();

console.log('📂 Kategóriák az adatbázisban:\n');
all.forEach(c => console.log(`  - ${c.category}: ${c.cnt} termék`));
console.log(`\n✅ Összesen: ${all.reduce((sum, c) => sum + c.cnt, 0)} termék`);

// Check full paths
console.log('\n📍 Teljes kategória útvonalak (első 10 termék):\n');
const samples = db.prepare('SELECT DISTINCT category, category_path FROM products LIMIT 10').all();
samples.forEach(s => {
  console.log(`  ${s.category}`);
  console.log(`    → ${s.category_path}\n`);
});

db.close();
