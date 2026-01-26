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

  console.log('✅ Database initialized successfully');
}

// Initialize on import
initializeDatabase();

export default db;
