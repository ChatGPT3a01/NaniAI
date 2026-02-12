import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Vercel serverless 只有 /tmp 可寫入
const DATA_DIR = process.env.VERCEL ? "/tmp" : path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "nani.db");

// 確保目錄存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subject TEXT,
      grade TEXT,
      filename TEXT NOT NULL,
      blob_url TEXT,
      total_pages INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Migration: 為既有資料庫新增 blob_url 欄位
  try {
    db.exec("ALTER TABLE books ADD COLUMN blob_url TEXT");
  } catch {
    // 欄位已存在，忽略
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
  `);

  // Insert default admin password if not exists
  const existing = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();
  if (!existing) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('admin_password', 'nani2026')").run();
  }

  // Insert default subjects if table is empty
  const subjectCount = db.prepare("SELECT COUNT(*) as count FROM subjects").get() as { count: number };
  if (subjectCount.count === 0) {
    const defaults = ["國語", "數學", "自然", "社會", "英語", "健康", "藝術", "綜合"];
    const insert = db.prepare("INSERT OR IGNORE INTO subjects (name) VALUES (?)");
    for (const name of defaults) {
      insert.run(name);
    }
  }
}
