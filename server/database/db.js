import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = path.join(__dirname, '..', '..', 'data', 'products.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL'); // Better performance for concurrent access

/**
 * Initialize database schema
 */
export function initializeDatabase() {
  // Products table
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      unas_id TEXT UNIQUE,
      name TEXT NOT NULL,
      price INTEGER NOT NULL DEFAULT 0,
      category TEXT NOT NULL,
      category_path TEXT,
      images TEXT, -- JSON array
      description TEXT,
      params TEXT,
      link TEXT,
      in_stock BOOLEAN DEFAULT 1,
      stock_qty INTEGER,
      
      -- Control fields
      show_in_ai BOOLEAN DEFAULT 1,
      priority INTEGER DEFAULT 0,
      custom_description TEXT,
      
      -- Metadata
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_synced_at DATETIME
    )
  `);

  // Add missing columns (lightweight migration)
  try {
    const columns = db.prepare('PRAGMA table_info(products)').all().map((c) => c.name);
    if (!columns.includes('stock_qty')) {
      db.exec('ALTER TABLE products ADD COLUMN stock_qty INTEGER');
    }
  } catch (err) {
    console.warn('⚠️ Could not run products table migration:', err);
  }

  // Categories table for configuration
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      category_path TEXT,
      enabled BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Sync history table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sync_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      status TEXT, -- 'running', 'completed', 'failed'
      products_fetched INTEGER DEFAULT 0,
      products_added INTEGER DEFAULT 0,
      products_updated INTEGER DEFAULT 0,
      error_message TEXT
    )
  `);

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_show_in_ai ON products(show_in_ai);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
    CREATE INDEX IF NOT EXISTS idx_categories_enabled ON categories(enabled);
  `);

  // FTS5 full-text search – 10–100x gyorsabb mint LIKE
  // remove_diacritics 1: ékezet eltávolítás mindkét oldalon (kanapé = kanape)
  db.exec(`
    CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
      name,
      category,
      description,
      params,
      content='products',
      content_rowid='rowid',
      tokenize='unicode61 remove_diacritics 1'
    )
  `);

  // Triggers: products INSERT/UPDATE/DELETE → products_fts sync
  db.exec(`
    DROP TRIGGER IF EXISTS products_fts_ai;
    CREATE TRIGGER products_fts_ai AFTER INSERT ON products BEGIN
      INSERT INTO products_fts(rowid, name, category, description, params)
      VALUES (new.rowid, new.name, COALESCE(new.category,''), COALESCE(new.description,''), COALESCE(new.params,''));
    END
  `);
  db.exec(`
    DROP TRIGGER IF EXISTS products_fts_ad;
    CREATE TRIGGER products_fts_ad AFTER DELETE ON products BEGIN
      INSERT INTO products_fts(products_fts, rowid, name, category, description, params)
      VALUES ('delete', old.rowid, old.name, COALESCE(old.category,''), COALESCE(old.description,''), COALESCE(old.params,''));
    END
  `);
  db.exec(`
    DROP TRIGGER IF EXISTS products_fts_au;
    CREATE TRIGGER products_fts_au AFTER UPDATE ON products BEGIN
      INSERT INTO products_fts(products_fts, rowid, name, category, description, params)
      VALUES ('delete', old.rowid, old.name, COALESCE(old.category,''), COALESCE(old.description,''), COALESCE(old.params,''));
      INSERT INTO products_fts(rowid, name, category, description, params)
      VALUES (new.rowid, new.name, COALESCE(new.category,''), COALESCE(new.description,''), COALESCE(new.params,''));
    END
  `);

  console.log('✅ Database initialized successfully');
}

/**
 * Populate products_fts from products (migration / initial sync).
 * Call after schema init – rebuilds FTS index from products table.
 * Uses rebuild to sync entire index from content table
 */
export function populateProductsFTS() {
  try {
    db.exec(`INSERT INTO products_fts(products_fts) VALUES('rebuild')`);
    const total = db.prepare('SELECT COUNT(*) as n FROM products_fts').get();
    console.log(`✅ products_fts populated: ${total?.n ?? 0} rows`);
    return total?.n ?? 0;
  } catch (err) {
    console.warn('⚠️ products_fts populate:', err.message);
    return 0;
  }
}

// Initialize on import
initializeDatabase();

// Populate FTS index from existing products (async to not block startup)
setImmediate(() => {
  try {
    populateProductsFTS();
  } catch (e) {
    console.warn('FTS populate deferred:', e?.message);
  }
});

export default db;
