import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "csreq.db");

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  _db = new Database(DB_PATH);
  _db.pragma("journal_mode = WAL");

  _db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      google_id TEXT UNIQUE,
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      name TEXT NOT NULL DEFAULT '',
      hometown TEXT NOT NULL DEFAULT '',
      purpose TEXT NOT NULL DEFAULT '',
      interests TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      home_text TEXT NOT NULL DEFAULT '',
      refs_text TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS verification_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pending_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    );
  `);

  // Migrate existing users table if it lacks new columns
  try { _db.exec(`ALTER TABLE users ADD COLUMN google_id TEXT`); } catch {}
  try { _db.exec(`ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { _db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS users_google_id ON users(google_id) WHERE google_id IS NOT NULL`); } catch {}
  try { _db.exec(`ALTER TABLE user_profiles ADD COLUMN refs_text TEXT NOT NULL DEFAULT ''`); } catch {}
  try { _db.exec(`ALTER TABLE verification_tokens ADD COLUMN code TEXT NOT NULL DEFAULT ''`); } catch {}
  try { _db.exec(`ALTER TABLE users ADD COLUMN letters_used INTEGER NOT NULL DEFAULT 0`); } catch {}
  try { _db.exec(`ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'`); } catch {}
  try { _db.exec(`ALTER TABLE users ADD COLUMN plan_expires_at INTEGER`); } catch {}
  try { _db.exec(`CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lemon_order_id TEXT UNIQUE,
    plan_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`); } catch {}

  // Admin accounts always get pro access
  try { _db.prepare("UPDATE users SET plan = 'pro', plan_expires_at = NULL, email_verified = 1 WHERE email = 'likosertugrul128@gmail.com'").run(); } catch {}

  return _db;
}
