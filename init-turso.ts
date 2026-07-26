import { createClient } from '@libsql/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function loadEnv() {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

let url = process.env.TURSO_DATABASE_URL || '';
const authToken = process.env.TURSO_AUTH_TOKEN || '';

if (!url || !authToken) {
  console.error('❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env');
  process.exit(1);
}

if (url.startsWith('libsql://')) {
  url = url.replace('libsql://', 'https://');
}

const turso = createClient({ url, authToken });

async function initSchema() {
  console.log('⚡ Initializing Turso Database Schema at:', url);

  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      email         TEXT UNIQUE NOT NULL,
      username      TEXT UNIQUE NOT NULL,
      pulse_id      TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name     TEXT,
      department    TEXT NOT NULL,
      level         TEXT NOT NULL,
      avatar_url    TEXT,
      role          TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
      is_banned     INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS sessions (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT UNIQUE NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      last_active TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS posts (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT NOT NULL,
      media_url   TEXT,
      is_flagged  INTEGER NOT NULL DEFAULT 0,
      is_deleted  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS likes (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      value       INTEGER DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, post_id)
    )`,

    `CREATE TABLE IF NOT EXISTS votes (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      value       INTEGER NOT NULL CHECK(value IN (-1, 1)),
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, post_id)
    )`,

    `CREATE TABLE IF NOT EXISTS resources (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT,
      file_url    TEXT,
      link_url    TEXT,
      uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_deleted  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS news (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      content     TEXT NOT NULL,
      posted_by   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_deleted  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS events (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT NOT NULL,
      event_date  TEXT NOT NULL,
      location    TEXT,
      media_url   TEXT,
      posted_by   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_deleted  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS admin_logs (
      id          TEXT PRIMARY KEY,
      admin_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
      action      TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id   TEXT NOT NULL,
      metadata    TEXT NOT NULL DEFAULT '{}',
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS comments (
      id          TEXT PRIMARY KEY,
      post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT NOT NULL,
      is_deleted  INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS saved_posts (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      created_at  TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, post_id)
    )`,

    `CREATE TABLE IF NOT EXISTS follows (
      id           TEXT PRIMARY KEY,
      follower_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at   TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(follower_id, following_id)
    )`,

    `CREATE TABLE IF NOT EXISTS direct_messages (
      id          TEXT PRIMARY KEY,
      sender_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      content     TEXT NOT NULL,
      is_read     INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`,

    `CREATE TABLE IF NOT EXISTS notifications (
      id          TEXT PRIMARY KEY,
      user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      message     TEXT NOT NULL,
      link        TEXT NOT NULL DEFAULT '',
      is_read     INTEGER NOT NULL DEFAULT 0,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  ];

  for (const sql of statements) {
    await turso.execute(sql);
  }

  const migrations = [
    `ALTER TABLE likes ADD COLUMN value INTEGER DEFAULT 1`,
    `ALTER TABLE posts ADD COLUMN media_url TEXT`,
    `ALTER TABLE events ADD COLUMN media_url TEXT`,
  ];

  for (const sql of migrations) {
    try {
      await turso.execute(sql);
    } catch (e) {
      // Column might already exist, ignore error
    }
  }

  console.log('🎉 SUCCESS: Turso Schema & Migrations Applied Successfully!');
}

initSchema().catch(err => {
  console.error('❌ Failed to initialize schema on Turso:', err);
  process.exit(1);
});
