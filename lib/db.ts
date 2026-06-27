import { createClient, type Client } from "@libsql/client";

let _db: Client | null = null;

export async function getDb(): Promise<Client> {
  if (_db) return _db;

  _db = createClient({
    url: process.env.TURSO_DATABASE_URL ?? "file:./csreq.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // Base schema
  for (const sql of [
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      google_id TEXT,
      email_verified INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id),
      name TEXT NOT NULL DEFAULT '',
      hometown TEXT NOT NULL DEFAULT '',
      purpose TEXT NOT NULL DEFAULT '',
      interests TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      home_text TEXT NOT NULL DEFAULT '',
      refs_text TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS verification_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS oauth_states (
      state TEXT PRIMARY KEY,
      expires_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS pending_sessions (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      expires_at INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lemon_order_id TEXT UNIQUE,
      plan_type TEXT NOT NULL,
      amount INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL
    )`,
  ]) {
    try { await _db.execute(sql); } catch {}
  }

  // Migrations
  for (const sql of [
    `ALTER TABLE users ADD COLUMN google_id TEXT`,
    `ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0`,
    `CREATE UNIQUE INDEX IF NOT EXISTS users_google_id ON users(google_id) WHERE google_id IS NOT NULL`,
    `ALTER TABLE user_profiles ADD COLUMN refs_text TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE verification_tokens ADD COLUMN code TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE users ADD COLUMN letters_used INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE users ADD COLUMN plan TEXT NOT NULL DEFAULT 'free'`,
    `ALTER TABLE users ADD COLUMN plan_expires_at INTEGER`,
  ]) {
    try { await _db.execute(sql); } catch {}
  }

  // Admin always pro
  try {
    await _db.execute({
      sql: "UPDATE users SET plan = 'pro', plan_expires_at = NULL, email_verified = 1 WHERE email = ?",
      args: ["likosertugrul128@gmail.com"],
    });
  } catch {}

  return _db;
}
