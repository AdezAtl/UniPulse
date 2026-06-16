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

  CREATE TABLE IF NOT EXISTS events (
    id          TEXT PRIMARY KEY,
    title       TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date  TEXT NOT NULL,
    location    TEXT,
    media_url   TEXT,
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

  CREATE TABLE IF NOT EXISTS comments (
    id          TEXT PRIMARY KEY,
    post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    is_deleted  INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saved_posts (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, post_id)
  );

  CREATE TABLE IF NOT EXISTS follows (
    id           TEXT PRIMARY KEY,
    follower_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(follower_id, following_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message     TEXT NOT NULL,
    link        TEXT NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS event_registrations (
    id          TEXT PRIMARY KEY,
    user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id    TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, event_id)
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          TEXT PRIMARY KEY,
    sender_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_posts_user_id    ON posts(user_id);
  CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_likes_post_id    ON likes(post_id);
  CREATE INDEX IF NOT EXISTS idx_likes_user_id    ON likes(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token);
  CREATE INDEX IF NOT EXISTS idx_sessions_user    ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_admin_logs_time  ON admin_logs(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_messages_users   ON messages(sender_id, receiver_id);
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

try {
  db.pragma('foreign_keys = OFF');
  db.exec('ALTER TABLE likes ADD COLUMN value INTEGER NOT NULL DEFAULT 1');
  db.pragma('foreign_keys = ON');
} catch (err) {
  // Ignore error if column already exists
}

try {
  db.pragma('foreign_keys = OFF');
  db.exec('ALTER TABLE posts ADD COLUMN media_url TEXT');
  db.pragma('foreign_keys = ON');
} catch (err) {
  // Ignore error if column already exists
}

try {
  db.pragma('foreign_keys = OFF');
  db.exec('ALTER TABLE events ADD COLUMN media_url TEXT');
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
  id: string; email?: string; username: string; pulse_id: string;
  full_name: string | null; department: string; level: string;
  avatar_url: string | null; role: UserRole; is_banned: boolean; created_at: string;
}

export interface Post {
  id: string; user_id: string; content: string; media_url: string | null;
  is_flagged: boolean; is_deleted: boolean; created_at: string;
}

export interface PostWithMeta extends Post {
  author_id: string; username: string; pulse_id: string; full_name: string | null;
  department: string; level: string; avatar_url: string | null;
  author_role: UserRole; like_count: number; comment_count: number;
  is_banned?: boolean;
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

export interface EventItem {
  id: string; title: string; description: string;  event_date: string;
  location: string | null;
  media_url: string | null;
  posted_by: string;
  author_username?: string;
  is_deleted: boolean; created_at: string;
}

export interface SearchResults {
  users: User[];
  posts: PostWithMeta[];
  resources: Resource[];
  news: NewsItem[];
  events: EventItem[];
}

export interface AdminLog {
  id: string; admin_id: string | null; action: string;
  target_type: string; target_id: string;
  metadata: Record<string, unknown>; created_at: string;
  admin_username?: string | null;
}

export interface Comment {
  id: string; post_id: string; user_id: string; content: string;
  is_deleted: boolean; created_at: string;
  username?: string; avatar_url?: string | null;
}

export interface Notification {
  id: string; user_id: string; message: string; link: string;
  is_read: boolean; created_at: string;
}

// SQLite stores booleans as 0/1 integers — normalise on the way out
function normaliseUser(row: any): User {
  if (!row) return row;
  return { ...row, is_banned: row.is_banned === 1 };
}

function normalisePost(row: any): PostWithMeta {
  return {
    ...row,
    is_flagged: Boolean(row.is_flagged),
    is_deleted: Boolean(row.is_deleted),
    is_banned: row.is_banned !== undefined ? Boolean(row.is_banned) : false,
  };
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
  db.prepare('INSERT INTO users (id, email, username, pulse_id, password_hash, full_name, department, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(data.id, data.email, data.username, data.pulse_id, data.password_hash, data.full_name, data.department, data.level);
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
  const rows = db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
  return rows.map(normaliseUser);
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
    p.id, p.content, p.media_url, p.is_flagged, p.is_deleted, p.created_at,
    p.user_id AS author_id,
    u.username, u.pulse_id, u.full_name, u.department, u.level,
    u.avatar_url, u.role AS author_role, u.is_banned,
    IFNULL(SUM(l.value), 0) AS like_count,
    (SELECT COUNT(*) FROM comments WHERE post_id = p.id AND is_deleted = 0) AS comment_count
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

export function getPostById(postId: string): PostWithMeta | null {
  const row = db.prepare(`
    ${POST_WITH_META_SQL}
    WHERE p.is_deleted = 0 AND p.id = ?
    GROUP BY p.id
  `).get(postId) as any;
  return row ? normalisePost(row) : null;
}

export function getAllPostsAdmin(limit = 60): PostWithMeta[] {
  return (db.prepare(`
    ${POST_WITH_META_SQL}
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT ?
  `).all(limit) as any[]).map(normalisePost);
}

export function createPost(userId: string, content: string, mediaUrl: string | null = null): Post {
  const id = newId();
  db.prepare('INSERT INTO posts (id, user_id, content, media_url) VALUES (?, ?, ?, ?)').run(id, userId, content, mediaUrl);
  
  // Trigger notifications for followers
  const user = getUserById(userId);
  if (user) {
    const followers = getFollowerIds(userId);
    const msg = `@${user.username} published a new post.`;
    const link = `/post/${id}`;
    const insertNotif = db.prepare('INSERT INTO notifications (id, user_id, message, link) VALUES (?, ?, ?, ?)');
    
    // Run in a transaction for better performance if many followers
    const sendNotifs = db.transaction(() => {
      for (const followerId of followers) {
        insertNotif.run(newId(), followerId, msg, link);
      }
    });
    sendNotifs();
  }
  
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

// ── Vote queries ──────────────────────────────────────────────────────────────

export function getUserVotes(userId: string): Record<string, number> {
  const rows = db.prepare('SELECT post_id, value FROM likes WHERE user_id = ?').all(userId) as any[];
  const map: Record<string, number> = {};
  for (const r of rows) map[r.post_id] = r.value;
  return map;
}

export function getLikedPostIds(userId: string): string[] {
  // Backwards compatibility for old code expecting just liked IDs
  return (db.prepare('SELECT post_id FROM likes WHERE user_id = ? AND value > 0').all(userId) as any[])
    .map(r => r.post_id);
}

export function addVote(userId: string, postId: string, value: number) {
  // UPSERT
  db.prepare(`
    INSERT INTO likes (id, user_id, post_id, value)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, post_id) DO UPDATE SET value = excluded.value
  `).run(newId(), userId, postId, value);
}

export function removeVote(userId: string, postId: string) {
  db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
}

export function addLike(userId: string, postId: string) { addVote(userId, postId, 1); }
export function removeLike(userId: string, postId: string) { removeVote(userId, postId); }

// ── Comment queries ───────────────────────────────────────────────────────────

export function getPostComments(postId: string): Comment[] {
  return db.prepare(`
    SELECT c.*, u.username, u.avatar_url
    FROM comments c
    JOIN users u ON u.id = c.user_id
    WHERE c.post_id = ? AND c.is_deleted = 0
    ORDER BY c.created_at ASC
  `).all(postId) as Comment[];
}

export function createComment(postId: string, userId: string, content: string): Comment {
  const id = newId();
  db.prepare('INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)').run(id, postId, userId, content);
  return db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as Comment;
}

export function getCommentCount(postId: string): number {
  const row = db.prepare('SELECT COUNT(*) as c FROM comments WHERE post_id = ? AND is_deleted = 0').get(postId) as any;
  return row?.c ?? 0;
}

// ── Save queries ──────────────────────────────────────────────────────────────

export function getSavedPostIds(userId: string): Set<string> {
  const rows = db.prepare('SELECT post_id FROM saved_posts WHERE user_id = ?').all(userId) as any[];
  return new Set(rows.map(r => r.post_id));
}

export function getSavedPosts(userId: string): PostWithMeta[] {
  return (db.prepare(`
    ${POST_WITH_META_SQL}
    JOIN saved_posts sp ON sp.post_id = p.id
    WHERE p.is_deleted = 0 AND u.is_banned = 0 AND sp.user_id = ?
    GROUP BY p.id
    ORDER BY sp.created_at DESC
  `).all(userId) as any[]).map(normalisePost);
}

export function toggleSavedPost(userId: string, postId: string): boolean {
  const existing = db.prepare('SELECT id FROM saved_posts WHERE user_id = ? AND post_id = ?').get(userId, postId);
  if (existing) {
    db.prepare('DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?').run(userId, postId);
    return false;
  } else {
    db.prepare('INSERT INTO saved_posts (id, user_id, post_id) VALUES (?, ?, ?)').run(newId(), userId, postId);
    return true;
  }
}

// ── Follow queries ────────────────────────────────────────────────────────────

export function getFollowingIds(userId: string): Set<string> {
  const rows = db.prepare('SELECT following_id FROM follows WHERE follower_id = ?').all(userId) as any[];
  return new Set(rows.map(r => r.following_id));
}

export function getFollowerIds(userId: string): string[] {
  return (db.prepare('SELECT follower_id FROM follows WHERE following_id = ?').all(userId) as any[]).map(r => r.follower_id);
}

export function toggleFollow(followerId: string, followingId: string): boolean {
  if (followerId === followingId) return false;
  const existing = db.prepare('SELECT id FROM follows WHERE follower_id = ? AND following_id = ?').get(followerId, followingId);
  if (existing) {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(followerId, followingId);
    return false;
  } else {
    db.prepare('INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)').run(newId(), followerId, followingId);
    return true;
  }
}

// ── Notification queries ──────────────────────────────────────────────────────

export function getUserNotifications(userId: string): Notification[] {
  return db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50').all(userId) as Notification[];
}

export function getUnreadNotificationCount(userId: string): number {
  const row = db.prepare('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0').get(userId) as any;
  return row?.c ?? 0;
}

export function markNotificationsRead(userId: string) {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(userId);
}

export function createNotification(userId: string, message: string, link: string) {
  db.prepare('INSERT INTO notifications (id, user_id, message, link) VALUES (?, ?, ?, ?)').run(newId(), userId, message, link);
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

// ── Events queries ────────────────────────────────────────────────────────────

export function getEvents(): EventItem[] {
  return db.prepare(`
    SELECT e.*, u.username AS author_username
    FROM events e
    LEFT JOIN users u ON u.id = e.posted_by
    WHERE e.is_deleted = 0
    ORDER BY e.event_date DESC
  `).all() as EventItem[];
}

export function getAllEventsAdmin(): EventItem[] {
  return db.prepare(`
    SELECT e.*, u.username AS author_username
    FROM events e
    LEFT JOIN users u ON u.id = e.posted_by
    ORDER BY e.event_date DESC
  `).all() as EventItem[];
}

export function createEvent(title: string, description: string, event_date: string, location: string, postedBy: string, media_url: string | null = null) {
  const id = newId();
  db.prepare('INSERT INTO events (id, title, description, event_date, location, posted_by, media_url) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, title, description, event_date, location, postedBy, media_url);
}

export function updateEvent(id: string, data: Partial<{ title: string; description: string; event_date: string; location: string; is_deleted: number }>) {
  const fields = Object.keys(data).map(k => `${k} = @${k}`).join(', ');
  db.prepare(`UPDATE events SET ${fields} WHERE id = @id`).run({ ...data, id });
}

export function getRegisteredEvents(userId: string): EventItem[] {
  return db.prepare(`
    SELECT e.*, u.username AS author_username
    FROM events e
    JOIN event_registrations er ON e.id = er.event_id
    LEFT JOIN users u ON u.id = e.posted_by
    WHERE er.user_id = ? AND e.is_deleted = 0
    ORDER BY e.event_date ASC
  `).all(userId) as EventItem[];
}

export function getRegisteredEventIds(userId: string): Set<string> {
  const rows = db.prepare('SELECT event_id FROM event_registrations WHERE user_id = ?').all(userId) as any[];
  return new Set(rows.map(r => r.event_id));
}

export function toggleEventRegistration(userId: string, eventId: string): boolean {
  const existing = db.prepare('SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?').get(userId, eventId);
  if (existing) {
    db.prepare('DELETE FROM event_registrations WHERE user_id = ? AND event_id = ?').run(userId, eventId);
    return false;
  } else {
    db.prepare('INSERT INTO event_registrations (id, user_id, event_id) VALUES (?, ?, ?)').run(newId(), userId, eventId);
    return true;
  }
}

// ── Global Search ─────────────────────────────────────────────────────────────

export function searchAll(query: string, currentUserId: string): SearchResults {
  const q = `%${query}%`;
  
  const users = (db.prepare(`
    SELECT * FROM users 
    WHERE (username LIKE ? OR full_name LIKE ? OR department LIKE ?) AND is_banned = 0
    LIMIT 20
  `).all(q, q, q) as any[]).map(normaliseUser);

  const posts = (db.prepare(`
    ${POST_WITH_META_SQL}
    WHERE p.is_deleted = 0 AND u.is_banned = 0 AND p.content LIKE ?
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT 20
  `).all(q) as any[]).map(normalisePost);

  const resources = db.prepare(`
    SELECT r.*, u.username AS uploader_username
    FROM resources r
    LEFT JOIN users u ON u.id = r.uploaded_by
    WHERE r.is_deleted = 0 AND (r.title LIKE ? OR r.description LIKE ?)
    LIMIT 20
  `).all(q, q) as Resource[];

  const news = db.prepare(`
    SELECT n.*, u.username AS author_username
    FROM news n
    LEFT JOIN users u ON u.id = n.posted_by
    WHERE n.is_deleted = 0 AND (n.title LIKE ? OR n.content LIKE ?)
    LIMIT 20
  `).all(q, q) as NewsItem[];

  const events = db.prepare(`
    SELECT e.*, u.username AS author_username
    FROM events e
    LEFT JOIN users u ON u.id = e.posted_by
    WHERE e.is_deleted = 0 AND (e.title LIKE ? OR e.description LIKE ? OR e.location LIKE ?)
    LIMIT 20
  `).all(q, q, q) as EventItem[];

  return { users, posts, resources, news, events };
}

// ── Direct Messaging ──────────────────────────────────────────────────────────

export interface Message {
  id: string; sender_id: string; receiver_id: string;
  content: string; is_read: boolean; created_at: string;
}

export interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
}

export function getConversations(userId: string): Conversation[] {
  // Get all unique users we've chatted with
  const userRows = db.prepare(`
    SELECT DISTINCT u.*
    FROM users u
    JOIN messages m ON (m.sender_id = u.id AND m.receiver_id = ?) OR (m.receiver_id = u.id AND m.sender_id = ?)
    WHERE u.is_banned = 0
  `).all(userId, userId) as any[];

  const convos: Conversation[] = [];
  
  for (const row of userRows) {
    const otherUser = normaliseUser(row);
    const lastMsgRow = db.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at DESC LIMIT 1
    `).get(userId, otherUser.id, otherUser.id, userId) as any;
    
    const unreadCountRow = db.prepare(`
      SELECT COUNT(*) as c FROM messages 
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `).get(otherUser.id, userId) as any;
    
    if (lastMsgRow) {
      convos.push({
        user: otherUser,
        last_message: { ...lastMsgRow, is_read: lastMsgRow.is_read === 1 },
        unread_count: unreadCountRow?.c || 0
      });
    }
  }

  // Sort by latest message
  convos.sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());
  
  return convos;
}

export function getMessages(userId1: string, userId2: string): Message[] {
  return (db.prepare(`
    SELECT * FROM messages 
    WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
    ORDER BY created_at ASC
  `).all(userId1, userId2, userId2, userId1) as any[]).map(r => ({ ...r, is_read: r.is_read === 1 }));
}

export function sendMessage(senderId: string, receiverId: string, content: string): Message {
  const id = newId();
  db.prepare(`
    INSERT INTO messages (id, sender_id, receiver_id, content) 
    VALUES (?, ?, ?, ?)
  `).run(id, senderId, receiverId, content);
  const row = db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as any;
  return { ...row, is_read: row.is_read === 1 };
}

export function markMessagesRead(senderId: string, receiverId: string) {
  db.prepare(`
    UPDATE messages SET is_read = 1 
    WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
  `).run(senderId, receiverId); // We mark messages sent BY sender TO receiver as read
}