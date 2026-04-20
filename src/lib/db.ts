// src/lib/db.ts
// SQLite via better-sqlite3 — fully offline, no external services.
// All queries are synchronous (better-sqlite3 is sync-only by design).

import Database from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';

// ── Database file location ────────────────────────────────────────────────────
// Stored at <project-root>/data/unipulse.db
// The data/ folder is gitignored so the DB stays local.
const DATA_DIR = join(process.cwd(), 'data');
mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = join(DATA_DIR, 'unipulse.db');
export const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ────────────────────────────────────────────────────────────────────
// Run once on startup — CREATE TABLE IF NOT EXISTS is idempotent.

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    email       TEXT UNIQUE NOT NULL,
    username    TEXT UNIQUE NOT NULL,
    pulse_id    TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name   TEXT,
    department  TEXT NOT NULL,
    level       TEXT NOT NULL,
    avatar_url  TEXT,
    role        TEXT NOT NULL DEFAULT 'user' CHECK(role IN ('user','admin')),
    is_banned   INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       TEXT UNIQUE NOT NULL,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    last_active TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS posts (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    is_flagged  INTEGER NOT NULL DEFAULT 0,
    is_deleted  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS likes (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, post_id)
  );

  CREATE TABLE IF NOT EXISTS resources (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT,
    file_url    TEXT,
    link_url    TEXT,
    uploaded_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_deleted  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS news (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    posted_by   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_deleted  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS admin_logs (
    id          TEXT PRIMARY KEY,
    admin_id    TEXT REFERENCES users(id) ON DELETE SET NULL,
    action      TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id   TEXT NOT NULL,
    metadata    TEXT NOT NULL DEFAULT '{}',
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_posts_user_id    ON posts(user_id);
  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_likes_post_id    ON likes(post_id);
  CREATE INDEX IF NOT EXISTS idx_likes_user_id    ON likes(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_admin_logs_time  ON admin_logs(created_at DESC);
`);

// ── Migrations ────────────────────────────────────────────────────────────────
try {
  // Attempt to add the column for pre-existing databases that missed it.
  db.pragma('foreign_keys = OFF');
  db.exec('ALTER TABLE users ADD COLUMN password_hash TEXT NOT NULL DEFAULT ""');
  db.pragma('foreign_keys = ON');
} catch (err) {
  // Ignore error if column already exists
}

// ── ID generator ──────────────────────────────────────────────────────────────
export function newId(): string {
  // Simple UUID v4
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = 'user' | 'admin';

export interface User {
  id: string; email: string; username: string; pulse_id: string;
  full_name: string | null; department: string; level: string;
  avatar_url: string | null; role: UserRole; is_banned: boolean; created_at: string;
}

export interface Post {
  id: string; user_id: string; content: string;
  is_flagged: boolean; is_deleted: boolean; created_at: string;
}

export interface PostWithMeta extends Post {
  author_id: string; username: string; pulse_id: string; full_name: string | null;
  department: string; level: string; avatar_url: string | null;
  author_role: UserRole; like_count: number;
}

export interface Resource {
  id: string; title: string; description: string | null;
  file_url: string | null; link_url: string | null;
  uploaded_by: string; uploader_username: string | null;
  is_deleted: boolean; created_at: string;
}

export interface NewsItem {
  id: string; title: string; content: string;
  posted_by: string; author_username: string | null;
  is_deleted: boolean; created_at: string;
}

export interface AdminLog {
  id: string; admin_id: string | null; action: string;
  target_type: string; target_id: string;
  metadata: Record<string, unknown>; created_at: string;
  admin_username?: string | null;
}

// SQLite stores booleans as 0/1 integers — normalise on the way out
function normaliseUser(row: any): User {
  if (!row) return row;
  return { ...row, is_banned: row.is_banned === 1 };
}

function normalisePost(row: any): PostWithMeta {
  if (!row) return row;
  return { ...row, is_flagged: row.is_flagged === 1, is_deleted: row.is_deleted === 1 };
}

// ── User queries ──────────────────────────────────────────────────────────────

export function getUserById(id: string): User | null {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  return row ? normaliseUser(row) : null;
}

export function getUserByEmail(email: string): (User & { password_hash: string }) | null {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
  return row ? { ...normaliseUser(row), password_hash: row.password_hash } : null;
}

export function getUserByUsername(username: string): (User & { password_hash: string }) | null {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
  return row ? { ...normaliseUser(row), password_hash: row.password_hash } : null;
}

export function getUserByPulseId(pulseId: string): (User & { password_hash: string }) | null {
  const row = db.prepare('SELECT * FROM users WHERE pulse_id = ?').get(pulseId) as any;
  return row ? { ...normaliseUser(row), password_hash: row.password_hash } : null;
}

export function createUser(data: {
  id: string; email: string; username: string; pulse_id: string;
  password_hash: string; full_name: string | null;
  department: string; level: string;
}): User {
  db.prepare(`
    INSERT INTO users (id, email, username, pulse_id, password_hash, full_name, department, level)
    VALUES (@id, @email, @username, @pulse_id, @password_hash, @full_name, @department, @level)
  `).run(data);
  return getUserById(data.id)!;
}

export function updateUser(id: string, data: Partial<{
  username: string; full_name: string | null; department: string; level: string; avatar_url: string | null;
}>) {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE users SET ${fields} WHERE id = @id`).run({ ...data, id });
}

export function updateUserPassword(id: string, password_hash: string) {
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(password_hash, id);
}

export function setUserRole(id: string, role: UserRole) {
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, id);
}

export function setUserBanned(id: string, banned: boolean) {
  db.prepare('UPDATE users SET is_banned = ? WHERE id = ?').run(banned ? 1 : 0, id);
}

export function getAllUsers(): User[] {
  return (db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[]).map(normaliseUser);
}

export function getPasswordHash(userId: string): string | null {
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(userId) as any;
  return row?.password_hash ?? null;
}

// ── Session queries ───────────────────────────────────────────────────────────

const SESSION_INACTIVE_DAYS = 3;

export function createSession(userId: string): string {
  const token = newId() + newId(); // 72-char random token
  db.prepare(`
    INSERT INTO sessions (id, user_id, token)
    VALUES (?, ?, ?)
  `).run(newId(), userId, token);
  return token;
}

export function getSessionUser(token: string): User | null {
  const row = db.prepare(`
    SELECT s.*, u.*
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ?
      AND u.is_banned = 0
  `).get(token) as any;

  if (!row) return null;

  // Check inactivity — if last_active > 3 days ago, delete and return null
  const lastActive = new Date(row.last_active + ' UTC');
  const diffDays = (Date.now() - lastActive.getTime()) / 86_400_000;
  if (diffDays > SESSION_INACTIVE_DAYS) {
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    return null;
  }

  // Slide the expiry — update last_active to now
  db.prepare(`UPDATE sessions SET last_active = datetime('now') WHERE token = ?`).run(token);

  return normaliseUser(row);
}

export function deleteSession(token: string) {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function deleteAllUserSessions(userId: string) {
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

// ── Post queries ──────────────────────────────────────────────────────────────

const POST_WITH_META_SQL = `
  SELECT
    p.id, p.content, p.is_flagged, p.is_deleted, p.created_at,
    p.user_id AS author_id,
    u.username, u.pulse_id, u.full_name, u.department, u.level,
    u.avatar_url, u.role AS author_role,
    COUNT(l.id) AS like_count
  FROM posts p
  JOIN users u ON u.id = p.user_id
  LEFT JOIN likes l ON l.post_id = p.id
`;

export function getFeedPosts(limit = 40): PostWithMeta[] {
  return (db.prepare(`
    ${POST_WITH_META_SQL}
    WHERE p.is_deleted = 0 AND u.is_banned = 0
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(limit) as any[]).map(normalisePost);
}

export function getUserPosts(userId: string): PostWithMeta[] {
  return (db.prepare(`
    ${POST_WITH_META_SQL}
    WHERE p.is_deleted = 0 AND u.is_banned = 0 AND p.user_id = ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
  `).all(userId) as any[]).map(normalisePost);
}

export function getAllPostsAdmin(limit = 60): PostWithMeta[] {
  return (db.prepare(`
    ${POST_WITH_META_SQL}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(limit) as any[]).map(normalisePost);
}

export function createPost(userId: string, content: string): Post {
  const id = newId();
  db.prepare('INSERT INTO posts (id, user_id, content) VALUES (?, ?, ?)').run(id, userId, content);
  return db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as Post;
}

export function getTodayPostCount(userId: string): number {
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  const row = db.prepare(`
    SELECT COUNT(*) AS cnt FROM posts
    WHERE user_id = ? AND is_deleted = 0 AND created_at >= ?
  `).get(userId, midnight.toISOString()) as any;
  return row?.cnt ?? 0;
}

export function getLastPostTime(userId: string): Date | null {
  const row = db.prepare(`
    SELECT created_at FROM posts
    WHERE user_id = ? AND is_deleted = 0
    ORDER BY created_at DESC LIMIT 1
  `).get(userId) as any;
  return row ? new Date(row.created_at + ' UTC') : null;
}

export function updatePost(id: string, data: Partial<{ content: string; is_flagged: number; is_deleted: number }>) {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE posts SET ${fields} WHERE id = @id`).run({ ...data, id });
}

// ── Like queries ──────────────────────────────────────────────────────────────

export function getLikedPostIds(userId: string): string[] {
  return (db.prepare('SELECT post_id FROM likes WHERE user_id = ?').all(userId) as any[])
    .map(r => r.post_id);
}

export function addLike(userId: string, postId: string) {
  try {
    db.prepare('INSERT INTO likes (id, user_id, post_id) VALUES (?, ?, ?)').run(newId(), userId, postId);
  } catch { /* ignore duplicate */ }
}

export function removeLike(userId: string, postId: string) {
  db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
}

// ── Resource queries ──────────────────────────────────────────────────────────

export function getResources(): Resource[] {
  return db.prepare(`
    SELECT r.*, u.username AS uploader_username
    FROM resources r
    LEFT JOIN users u ON u.id = r.uploaded_by
    WHERE r.is_deleted = 0
    ORDER BY r.created_at DESC
  `).all() as Resource[];
}

export function getAllResourcesAdmin(): Resource[] {
  return db.prepare(`
    SELECT r.*, u.username AS uploader_username
    FROM resources r
    LEFT JOIN users u ON u.id = r.uploaded_by
    ORDER BY r.created_at DESC
  `).all() as Resource[];
}

export function createResource(data: {
  title: string; description: string | null;
  file_url: string | null; link_url: string | null; uploaded_by: string;
}) {
  const id = newId();
  db.prepare(`
    INSERT INTO resources (id, title, description, file_url, link_url, uploaded_by)
    VALUES (@id, @title, @description, @file_url, @link_url, @uploaded_by)
  `).run({ id, ...data });
}

export function updateResource(id: string, data: Partial<{ title: string; description: string; is_deleted: number }>) {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE resources SET ${fields} WHERE id = @id`).run({ ...data, id });
}

// ── News queries ──────────────────────────────────────────────────────────────

export function getNews(): NewsItem[] {
  return db.prepare(`
    SELECT n.*, u.username AS author_username
    FROM news n
    LEFT JOIN users u ON u.id = n.posted_by
    WHERE n.is_deleted = 0
    ORDER BY n.created_at DESC
  `).all() as NewsItem[];
}

export function getAllNewsAdmin(): NewsItem[] {
  return db.prepare(`
    SELECT n.*, u.username AS author_username
    FROM news n
    LEFT JOIN users u ON u.id = n.posted_by
    ORDER BY n.created_at DESC
  `).all() as NewsItem[];
}

export function createNews(title: string, content: string, postedBy: string) {
  const id = newId();
  db.prepare('INSERT INTO news (id, title, content, posted_by) VALUES (?, ?, ?, ?)').run(id, title, content, postedBy);
}

export function updateNews(id: string, data: Partial<{ title: string; content: string; is_deleted: number }>) {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE news SET ${fields} WHERE id = @id`).run({ ...data, id });
}

// ── Admin log queries ─────────────────────────────────────────────────────────

export function addAdminLog(adminId: string, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}) {
  db.prepare(`
    INSERT INTO admin_logs (id, admin_id, action, target_type, target_id, metadata)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(newId(), adminId, action, targetType, targetId, JSON.stringify(metadata));
}

export function getAdminLogs(limit = 60): AdminLog[] {
  return (db.prepare(`
    SELECT al.*, u.username AS admin_username
    FROM admin_logs al
    LEFT JOIN users u ON u.id = al.admin_id
    ORDER BY al.created_at DESC
    LIMIT ?
  `).all(limit) as any[]).map(row => ({
    ...row,
    metadata: JSON.parse(row.metadata ?? '{}'),
  }));
}

// ── Admin stats ───────────────────────────────────────────────────────────────

export function getAdminStats() {
  const totalUsers = (db.prepare('SELECT COUNT(*) AS c FROM users').get() as any).c;
  const adminCount = (db.prepare("SELECT COUNT(*) AS c FROM users WHERE role='admin'").get() as any).c;
  const bannedCount = (db.prepare('SELECT COUNT(*) AS c FROM users WHERE is_banned=1').get() as any).c;
  const totalPosts = (db.prepare('SELECT COUNT(*) AS c FROM posts').get() as any).c;
  const flaggedPosts = (db.prepare('SELECT COUNT(*) AS c FROM posts WHERE is_flagged=1 AND is_deleted=0').get() as any).c;
  const deletedPosts = (db.prepare('SELECT COUNT(*) AS c FROM posts WHERE is_deleted=1').get() as any).c;
  const totalResources = (db.prepare('SELECT COUNT(*) AS c FROM resources WHERE is_deleted=0').get() as any).c;
  const totalNews = (db.prepare('SELECT COUNT(*) AS c FROM news WHERE is_deleted=0').get() as any).c;
  return { totalUsers, adminCount, bannedCount, totalPosts, flaggedPosts, deletedPosts, totalResources, totalNews };
}