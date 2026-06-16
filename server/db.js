// server/db.js
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "leads.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    wa_phone TEXT NOT NULL UNIQUE,
    name TEXT,
    email TEXT,
    inquiry_type TEXT,
    status TEXT DEFAULT 'new',
    notes TEXT,
    assigned_to TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    lead_id TEXT NOT NULL,
    state TEXT DEFAULT 'awaiting_name',
    last_message_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL,
    direction TEXT NOT NULL,
    body TEXT,
    raw_payload TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id)
  );
`);

module.exports = db;
