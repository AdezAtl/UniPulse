// src/lib/db.ts
// Direct Turso Cloud Database Adapter using @libsql/client
import { createClient } from '@libsql/client';

const url = (process.env.TURSO_DATABASE_URL || import.meta.env.TURSO_DATABASE_URL || '').replace('libsql://', 'https://');
const authToken = process.env.TURSO_AUTH_TOKEN || import.meta.env.TURSO_AUTH_TOKEN || '';

export const turso = createClient({
  url,
  authToken,
});

// Helper for generating UUIDs
export function newId(): string {
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
  id: string; title: string; description: string; event_date: string;
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

export interface Message {
  id: string; sender_id: string; receiver_id: string;
  content: string; is_read: boolean; created_at: string;
}

export interface Conversation {
  user: User;
  last_message: Message;
  unread_count: number;
}

function normaliseUser(row: any): User {
  if (!row) return row;
  return { ...row, is_banned: row.is_banned === 1 || row.is_banned === true };
}

function normalisePost(row: any): PostWithMeta {
  return {
    ...row,
    is_flagged: Boolean(row.is_flagged),
    is_deleted: Boolean(row.is_deleted),
    is_banned: row.is_banned !== undefined ? Boolean(row.is_banned) : false,
    like_count: Number(row.like_count || 0),
    comment_count: Number(row.comment_count || 0),
  };
}

// ── User Queries ──────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<User | null> {
  const rs = await turso.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [id] });
  const row = rs.rows[0] as any;
  return row ? normaliseUser(row) : null;
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const rs = await turso.execute({ sql: 'SELECT * FROM users WHERE email = ?', args: [email] });
  const row = rs.rows[0] as any;
  return row ? { ...normaliseUser(row), password_hash: row.password_hash } : null;
}

export async function getUserByUsername(username: string): Promise<(User & { password_hash: string }) | null> {
  const rs = await turso.execute({ sql: 'SELECT * FROM users WHERE username = ?', args: [username] });
  const row = rs.rows[0] as any;
  return row ? { ...normaliseUser(row), password_hash: row.password_hash } : null;
}

export async function getUserByPulseId(pulseId: string): Promise<(User & { password_hash: string }) | null> {
  const rs = await turso.execute({ sql: 'SELECT * FROM users WHERE pulse_id = ?', args: [pulseId] });
  const row = rs.rows[0] as any;
  return row ? { ...normaliseUser(row), password_hash: row.password_hash } : null;
}

export async function createUser(data: {
  id: string; email: string; username: string; pulse_id: string;
  password_hash: string; full_name: string | null;
  department: string; level: string;
}): Promise<User> {
  await turso.execute({
    sql: 'INSERT INTO users (id, email, username, pulse_id, password_hash, full_name, department, level) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    args: [data.id, data.email, data.username, data.pulse_id, data.password_hash, data.full_name, data.department, data.level]
  });
  const user = await getUserById(data.id);
  return user!;
}

export async function updateUser(id: string, data: Partial<{
  username: string; full_name: string | null; department: string; level: string; avatar_url: string | null;
}>): Promise<void> {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const setClauses = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (data as any)[k]);
  await turso.execute({
    sql: `UPDATE users SET ${setClauses} WHERE id = ?`,
    args: [...values, id]
  });
}

export async function updateUserPassword(id: string, password_hash: string): Promise<void> {
  await turso.execute({ sql: 'UPDATE users SET password_hash = ? WHERE id = ?', args: [password_hash, id] });
}

export async function setUserRole(id: string, role: UserRole): Promise<void> {
  await turso.execute({ sql: 'UPDATE users SET role = ? WHERE id = ?', args: [role, id] });
}

export async function setUserBanned(id: string, banned: boolean): Promise<void> {
  await turso.execute({ sql: 'UPDATE users SET is_banned = ? WHERE id = ?', args: [banned ? 1 : 0, id] });
}

export async function getAllUsers(): Promise<User[]> {
  const rs = await turso.execute('SELECT * FROM users ORDER BY created_at DESC');
  return rs.rows.map((r: any) => normaliseUser(r));
}

export async function getPasswordHash(userId: string): Promise<string | null> {
  const rs = await turso.execute({ sql: 'SELECT password_hash FROM users WHERE id = ?', args: [userId] });
  const row = rs.rows[0] as any;
  return row?.password_hash ?? null;
}

// ── Session Queries ───────────────────────────────────────────────────────────

const SESSION_INACTIVE_DAYS = 3;

export async function createSession(userId: string): Promise<string> {
  const token = newId() + newId();
  await turso.execute({
    sql: 'INSERT INTO sessions (id, user_id, token) VALUES (?, ?, ?)',
    args: [newId(), userId, token]
  });
  return token;
}

export async function getSessionUser(token: string): Promise<User | null> {
  const rs = await turso.execute({
    sql: `
      SELECT s.*, u.*
      FROM sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token = ?
        AND u.is_banned = 0
    `,
    args: [token]
  });

  const row = rs.rows[0] as any;
  if (!row) return null;

  const lastActive = new Date(row.last_active + ' UTC');
  const diffDays = (Date.now() - lastActive.getTime()) / 86_400_000;
  if (diffDays > SESSION_INACTIVE_DAYS) {
    await turso.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
    return null;
  }

  await turso.execute({
    sql: `UPDATE sessions SET last_active = datetime('now') WHERE token = ?`,
    args: [token]
  });

  return normaliseUser(row);
}

export async function deleteSession(token: string): Promise<void> {
  await turso.execute({ sql: 'DELETE FROM sessions WHERE token = ?', args: [token] });
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  await turso.execute({ sql: 'DELETE FROM sessions WHERE user_id = ?', args: [userId] });
}

// ── Post Queries ──────────────────────────────────────────────────────────────

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

export async function getFeedPosts(limit?: number): Promise<PostWithMeta[]> {
  const actualLimit = typeof limit === 'number' && limit > 0 ? limit : 40;
  const rs = await turso.execute({
    sql: `
      ${POST_WITH_META_SQL}
      WHERE p.is_deleted = 0 AND u.is_banned = 0
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `,
    args: [actualLimit]
  });
  return rs.rows.map(normalisePost);
}

export async function getUserPosts(userId: string): Promise<PostWithMeta[]> {
  const rs = await turso.execute({
    sql: `
      ${POST_WITH_META_SQL}
      WHERE p.is_deleted = 0 AND u.is_banned = 0 AND p.user_id = ?
      GROUP BY p.id
      ORDER BY p.created_at DESC
    `,
    args: [userId]
  });
  return rs.rows.map(normalisePost);
}

export async function getPostById(postId: string): Promise<PostWithMeta | null> {
  const rs = await turso.execute({
    sql: `
      ${POST_WITH_META_SQL}
      WHERE p.is_deleted = 0 AND p.id = ?
      GROUP BY p.id
    `,
    args: [postId]
  });
  const row = rs.rows[0] as any;
  return row ? normalisePost(row) : null;
}

export async function getAllPostsAdmin(limit?: number): Promise<PostWithMeta[]> {
  const actualLimit = typeof limit === 'number' && limit > 0 ? limit : 60;
  const rs = await turso.execute({
    sql: `
      ${POST_WITH_META_SQL}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ?
    `,
    args: [actualLimit]
  });
  return rs.rows.map(normalisePost);
}

export async function createPost(userId: string, content: string, mediaUrl: string | null = null): Promise<Post> {
  const id = newId();
  await turso.execute({
    sql: 'INSERT INTO posts (id, user_id, content, media_url) VALUES (?, ?, ?, ?)',
    args: [id, userId, content, mediaUrl]
  });
  const rs = await turso.execute({ sql: 'SELECT * FROM posts WHERE id = ?', args: [id] });
  return rs.rows[0] as any;
}

export async function getTodayPostCount(userId: string): Promise<number> {
  const rs = await turso.execute({
    sql: `SELECT COUNT(*) AS cnt FROM posts WHERE user_id = ? AND date(created_at) = date('now')`,
    args: [userId]
  });
  return Number((rs.rows[0] as any)?.cnt || 0);
}

export async function getLastPostTime(userId: string): Promise<Date | null> {
  const rs = await turso.execute({
    sql: `SELECT created_at FROM posts WHERE user_id = ? ORDER BY created_at DESC LIMIT 1`,
    args: [userId]
  });
  const ts = (rs.rows[0] as any)?.created_at;
  return ts ? new Date(ts) : null;
}

export async function updatePost(id: string, data: Partial<{ content: string; is_flagged: number; is_deleted: number }>): Promise<void> {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const setClauses = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (data as any)[k]);
  await turso.execute({
    sql: `UPDATE posts SET ${setClauses} WHERE id = ?`,
    args: [...values, id]
  });
}

// ── Vote & Like Queries ───────────────────────────────────────────────────────

export async function getUserVotes(userId: string): Promise<Record<string, number>> {
  const rs = await turso.execute({
    sql: 'SELECT post_id, value FROM votes WHERE user_id = ?',
    args: [userId]
  });
  const map: Record<string, number> = {};
  for (const row of rs.rows as any[]) {
    map[row.post_id] = Number(row.value);
  }
  return map;
}

export async function getLikedPostIds(userId: string): Promise<string[]> {
  const rs = await turso.execute({
    sql: 'SELECT post_id FROM likes WHERE user_id = ? AND value = 1',
    args: [userId]
  });
  return rs.rows.map((r: any) => r.post_id);
}

export async function addVote(userId: string, postId: string, value: number): Promise<void> {
  await turso.execute({
    sql: `
      INSERT INTO votes (id, user_id, post_id, value)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, post_id) DO UPDATE SET value = excluded.value
    `,
    args: [newId(), userId, postId, value]
  });
}

export async function removeVote(userId: string, postId: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM votes WHERE user_id = ? AND post_id = ?',
    args: [userId, postId]
  });
}

export async function addLike(userId: string, postId: string): Promise<void> {
  await turso.execute({
    sql: 'INSERT OR IGNORE INTO likes (id, user_id, post_id) VALUES (?, ?, ?)',
    args: [newId(), userId, postId]
  });
}

export async function removeLike(userId: string, postId: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
    args: [userId, postId]
  });
}

// ── Comment Queries ───────────────────────────────────────────────────────────

export async function getPostComments(postId: string): Promise<Comment[]> {
  const rs = await turso.execute({
    sql: `
      SELECT c.*, u.username, u.avatar_url
      FROM comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.post_id = ? AND c.is_deleted = 0
      ORDER BY c.created_at ASC
    `,
    args: [postId]
  });
  return rs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) }));
}

export async function createComment(postId: string, userId: string, content: string): Promise<Comment> {
  const id = newId();
  await turso.execute({
    sql: 'INSERT INTO comments (id, post_id, user_id, content) VALUES (?, ?, ?, ?)',
    args: [id, postId, userId, content]
  });
  const comments = await getPostComments(postId);
  return comments.find(c => c.id === id)!;
}

export async function getCommentCount(postId: string): Promise<number> {
  const rs = await turso.execute({
    sql: 'SELECT COUNT(*) as c FROM comments WHERE post_id = ? AND is_deleted = 0',
    args: [postId]
  });
  return Number((rs.rows[0] as any)?.c || 0);
}

// ── Saved Posts ───────────────────────────────────────────────────────────────

export async function getSavedPostIds(userId: string): Promise<Set<string>> {
  const rs = await turso.execute({
    sql: 'SELECT post_id FROM saved_posts WHERE user_id = ?',
    args: [userId]
  });
  return new Set(rs.rows.map((r: any) => r.post_id as string));
}

export async function getSavedPosts(userId: string): Promise<PostWithMeta[]> {
  const rs = await turso.execute({
    sql: `
      ${POST_WITH_META_SQL}
      JOIN saved_posts sp ON sp.post_id = p.id
      WHERE p.is_deleted = 0 AND u.is_banned = 0 AND sp.user_id = ?
      GROUP BY p.id
      ORDER BY sp.created_at DESC
    `,
    args: [userId]
  });
  return rs.rows.map(normalisePost);
}

export async function toggleSavedPost(userId: string, postId: string): Promise<boolean> {
  const rs = await turso.execute({
    sql: 'SELECT id FROM saved_posts WHERE user_id = ? AND post_id = ?',
    args: [userId, postId]
  });
  if (rs.rows.length > 0) {
    await turso.execute({
      sql: 'DELETE FROM saved_posts WHERE user_id = ? AND post_id = ?',
      args: [userId, postId]
    });
    return false;
  } else {
    await turso.execute({
      sql: 'INSERT INTO saved_posts (id, user_id, post_id) VALUES (?, ?, ?)',
      args: [newId(), userId, postId]
    });
    return true;
  }
}

// ── Follow Queries ────────────────────────────────────────────────────────────

export async function getFollowingIds(userId: string): Promise<Set<string>> {
  const rs = await turso.execute({
    sql: 'SELECT following_id FROM follows WHERE follower_id = ?',
    args: [userId]
  });
  return new Set(rs.rows.map((r: any) => r.following_id as string));
}

export async function getFollowerIds(userId: string): Promise<string[]> {
  const rs = await turso.execute({
    sql: 'SELECT follower_id FROM follows WHERE following_id = ?',
    args: [userId]
  });
  return rs.rows.map((r: any) => r.follower_id as string);
}

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  if (followerId === followingId) return false;
  const rs = await turso.execute({
    sql: 'SELECT id FROM follows WHERE follower_id = ? AND following_id = ?',
    args: [followerId, followingId]
  });
  if (rs.rows.length > 0) {
    await turso.execute({
      sql: 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
      args: [followerId, followingId]
    });
    return false;
  } else {
    await turso.execute({
      sql: 'INSERT INTO follows (id, follower_id, following_id) VALUES (?, ?, ?)',
      args: [newId(), followerId, followingId]
    });
    return true;
  }
}

// ── Resource Queries ──────────────────────────────────────────────────────────

export async function getResources(): Promise<Resource[]> {
  const rs = await turso.execute(`
    SELECT r.*, u.username AS uploader_username
    FROM resources r
    LEFT JOIN users u ON u.id = r.uploaded_by
    WHERE r.is_deleted = 0
    ORDER BY r.created_at DESC
  `);
  return rs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) }));
}

export async function createResource(data: {
  title: string; description: string | null;
  file_url: string | null; link_url: string | null;
  uploaded_by: string;
}): Promise<Resource> {
  const id = newId();
  await turso.execute({
    sql: 'INSERT INTO resources (id, title, description, file_url, link_url, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)',
    args: [id, data.title, data.description, data.file_url, data.link_url, data.uploaded_by]
  });
  const resources = await getResources();
  return resources.find(r => r.id === id)!;
}

export async function deleteResource(id: string): Promise<void> {
  await turso.execute({ sql: 'UPDATE resources SET is_deleted = 1 WHERE id = ?', args: [id] });
}

// ── News Queries ──────────────────────────────────────────────────────────────

export async function getNews(): Promise<NewsItem[]> {
  const rs = await turso.execute(`
    SELECT n.*, u.username AS author_username
    FROM news n
    LEFT JOIN users u ON u.id = n.posted_by
    WHERE n.is_deleted = 0
    ORDER BY n.created_at DESC
  `);
  return rs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) }));
}

export async function createNews(title: string, content: string, postedBy: string): Promise<NewsItem> {
  const id = newId();
  await turso.execute({
    sql: 'INSERT INTO news (id, title, content, posted_by) VALUES (?, ?, ?, ?)',
    args: [id, title, content, postedBy]
  });
  const news = await getNews();
  return news.find(n => n.id === id)!;
}

export const createNewsItem = createNews;

export async function deleteNewsItem(id: string): Promise<void> {
  await turso.execute({ sql: 'UPDATE news SET is_deleted = 1 WHERE id = ?', args: [id] });
}

// ── Event Queries ─────────────────────────────────────────────────────────────

export async function getEvents(): Promise<EventItem[]> {
  const rs = await turso.execute(`
    SELECT e.*, u.username AS author_username
    FROM events e
    LEFT JOIN users u ON u.id = e.posted_by
    WHERE e.is_deleted = 0
    ORDER BY e.event_date ASC
  `);
  return rs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) }));
}

export async function createEvent(data: {
  title: string; description: string; event_date: string;
  location: string | null; media_url?: string | null; posted_by: string;
}): Promise<EventItem> {
  const id = newId();
  await turso.execute({
    sql: 'INSERT INTO events (id, title, description, event_date, location, media_url, posted_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
    args: [id, data.title, data.description, data.event_date, data.location, data.media_url || null, data.posted_by]
  });
  const events = await getEvents();
  return events.find(e => e.id === id)!;
}

export async function deleteEvent(id: string): Promise<void> {
  await turso.execute({ sql: 'UPDATE events SET is_deleted = 1 WHERE id = ?', args: [id] });
}

export async function getRegisteredEvents(userId: string): Promise<EventItem[]> {
  const rs = await turso.execute({
    sql: `
      SELECT e.*, u.username AS author_username
      FROM events e
      JOIN event_registrations er ON e.id = er.event_id
      LEFT JOIN users u ON u.id = e.posted_by
      WHERE er.user_id = ? AND e.is_deleted = 0
      ORDER BY e.event_date ASC
    `,
    args: [userId]
  });
  return rs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) }));
}

export async function getRegisteredEventIds(userId: string): Promise<Set<string>> {
  const rs = await turso.execute({
    sql: 'SELECT event_id FROM event_registrations WHERE user_id = ?',
    args: [userId]
  });
  return new Set(rs.rows.map((r: any) => r.event_id as string));
}

export async function toggleEventRegistration(userId: string, eventId: string): Promise<boolean> {
  const rs = await turso.execute({
    sql: 'SELECT id FROM event_registrations WHERE user_id = ? AND event_id = ?',
    args: [userId, eventId]
  });
  if (rs.rows.length > 0) {
    await turso.execute({
      sql: 'DELETE FROM event_registrations WHERE user_id = ? AND event_id = ?',
      args: [userId, eventId]
    });
    return false;
  } else {
    await turso.execute({
      sql: 'INSERT INTO event_registrations (id, user_id, event_id) VALUES (?, ?, ?)',
      args: [newId(), userId, eventId]
    });
    return true;
  }
}

// ── Search & Audit Logs ───────────────────────────────────────────────────────

export async function search(query: string): Promise<SearchResults> {
  const term = `%${query}%`;
  const [usersRs, postsRs, resourcesRs, newsRs, eventsRs] = await Promise.all([
    turso.execute({ sql: `SELECT * FROM users WHERE username LIKE ? OR full_name LIKE ? OR pulse_id LIKE ? LIMIT 10`, args: [term, term, term] }),
    turso.execute({ sql: `${POST_WITH_META_SQL} WHERE p.content LIKE ? AND p.is_deleted = 0 GROUP BY p.id LIMIT 10`, args: [term] }),
    turso.execute({ sql: `SELECT r.*, u.username AS uploader_username FROM resources r LEFT JOIN users u ON u.id = r.uploaded_by WHERE r.title LIKE ? OR r.description LIKE ? LIMIT 10`, args: [term, term] }),
    turso.execute({ sql: `SELECT n.*, u.username AS author_username FROM news n LEFT JOIN users u ON u.id = n.posted_by WHERE n.title LIKE ? OR n.content LIKE ? LIMIT 10`, args: [term, term] }),
    turso.execute({ sql: `SELECT e.*, u.username AS author_username FROM events e LEFT JOIN users u ON u.id = e.posted_by WHERE e.title LIKE ? OR e.description LIKE ? LIMIT 10`, args: [term, term] }),
  ]);

  return {
    users: usersRs.rows.map(normaliseUser),
    posts: postsRs.rows.map(normalisePost),
    resources: resourcesRs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) })),
    news: newsRs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) })),
    events: eventsRs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) })),
  };
}

export const searchAll = search;

export async function getAdminLogs(limit = 50): Promise<AdminLog[]> {
  const rs = await turso.execute({
    sql: `
      SELECT l.*, u.username AS admin_username
      FROM admin_logs l
      LEFT JOIN users u ON u.id = l.admin_id
      ORDER BY l.created_at DESC
      LIMIT ?
    `,
    args: [limit]
  });
  return rs.rows.map((r: any) => ({
    ...r,
    metadata: typeof r.metadata === 'string' ? JSON.parse(r.metadata || '{}') : (r.metadata || {})
  }));
}

export async function logAdminAction(adminId: string | null, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await turso.execute({
    sql: 'INSERT INTO admin_logs (id, admin_id, action, target_type, target_id, metadata) VALUES (?, ?, ?, ?, ?, ?)',
    args: [newId(), adminId, action, targetType, targetId, JSON.stringify(metadata)]
  });
}

// ── Messages & Conversations ─────────────────────────────────────────────────

export async function getConversations(userId: string): Promise<Conversation[]> {
  const userRs = await turso.execute({
    sql: `
      SELECT DISTINCT u.*
      FROM users u
      JOIN direct_messages m ON (m.sender_id = u.id AND m.receiver_id = ?) OR (m.receiver_id = u.id AND m.sender_id = ?)
      WHERE u.is_banned = 0
    `,
    args: [userId, userId]
  });

  const convos: Conversation[] = [];
  for (const row of userRs.rows as any[]) {
    const otherUser = normaliseUser(row);
    const lastMsgRs = await turso.execute({
      sql: `
        SELECT * FROM direct_messages 
        WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
        ORDER BY created_at DESC LIMIT 1
      `,
      args: [userId, otherUser.id, otherUser.id, userId]
    });
    
    const unreadRs = await turso.execute({
      sql: `
        SELECT COUNT(*) as c FROM direct_messages 
        WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
      `,
      args: [otherUser.id, userId]
    });

    const lastMsg = lastMsgRs.rows[0] as any;
    if (lastMsg) {
      convos.push({
        user: otherUser,
        last_message: { ...lastMsg, is_read: Boolean(lastMsg.is_read) },
        unread_count: Number((unreadRs.rows[0] as any)?.c || 0)
      });
    }
  }

  convos.sort((a, b) => new Date(b.last_message.created_at).getTime() - new Date(a.last_message.created_at).getTime());
  return convos;
}

export async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
  const rs = await turso.execute({
    sql: `
      SELECT * FROM direct_messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
    `,
    args: [userId1, userId2, userId2, userId1]
  });
  return rs.rows.map((r: any) => ({ ...r, is_read: Boolean(r.is_read) }));
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
  const id = newId();
  await turso.execute({
    sql: 'INSERT INTO direct_messages (id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)',
    args: [id, senderId, receiverId, content]
  });
  const msgs = await getMessages(senderId, receiverId);
  return msgs.find(m => m.id === id)!;
}

export async function markMessagesRead(senderId: string, receiverId: string): Promise<void> {
  await turso.execute({
    sql: 'UPDATE direct_messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0',
    args: [senderId, receiverId]
  });
}

export async function getUpdates(userId: string) {
  const [unreadNotifRs, unreadMsgRs, latestPostRs, notifsRs, msgsRs] = await Promise.all([
    turso.execute({ sql: 'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0', args: [userId] }),
    turso.execute({ sql: 'SELECT COUNT(*) as c FROM direct_messages WHERE receiver_id = ? AND is_read = 0', args: [userId] }),
    turso.execute('SELECT created_at FROM posts WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT 1'),
    turso.execute({ sql: 'SELECT message, link FROM notifications WHERE user_id = ? AND is_read = 0 ORDER BY created_at DESC LIMIT 5', args: [userId] }),
    turso.execute({ sql: 'SELECT m.content, u.username FROM direct_messages m JOIN users u ON u.id = m.sender_id WHERE m.receiver_id = ? AND m.is_read = 0 ORDER BY m.created_at DESC LIMIT 5', args: [userId] }),
  ]);

  return {
    unreadNotifications: Number((unreadNotifRs.rows[0] as any)?.c || 0),
    unreadMessages: Number((unreadMsgRs.rows[0] as any)?.c || 0),
    latestPostTime: (latestPostRs.rows[0] as any)?.created_at || null,
    latestNotifications: notifsRs.rows,
    latestMessages: msgsRs.rows,
  };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function getNotifications(userId: string): Promise<Notification[]> {
  const rs = await turso.execute({
    sql: 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 30',
    args: [userId]
  });
  return rs.rows.map((r: any) => ({ ...r, is_read: Boolean(r.is_read) }));
}

export const getUserNotifications = getNotifications;

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const rs = await turso.execute({
    sql: 'SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND is_read = 0',
    args: [userId]
  });
  return Number((rs.rows[0] as any)?.c || 0);
}

export async function markNotificationsRead(userId: string): Promise<void> {
  await turso.execute({
    sql: 'UPDATE notifications SET is_read = 1 WHERE user_id = ?',
    args: [userId]
  });
}

export async function createNotification(userId: string, message: string, link = ''): Promise<void> {
  await turso.execute({
    sql: 'INSERT INTO notifications (id, user_id, message, link) VALUES (?, ?, ?, ?)',
    args: [newId(), userId, message, link]
  });
}

// ── Admin Helper Queries ──────────────────────────────────────────────────────

export async function getAdminStats(): Promise<{
  total_users: number;
  admin_count: number;
  banned_count: number;
  total_posts: number;
  flagged_posts: number;
  deleted_posts: number;
  total_resources: number;
  total_news: number;
}> {
  const [usersRs, postsRs, resRs, newsRs] = await Promise.all([
    turso.execute("SELECT role, is_banned FROM users"),
    turso.execute("SELECT is_flagged, is_deleted FROM posts"),
    turso.execute("SELECT is_deleted FROM resources"),
    turso.execute("SELECT is_deleted FROM news"),
  ]);

  const users = usersRs.rows as any[];
  const posts = postsRs.rows as any[];
  const resources = resRs.rows as any[];
  const news = newsRs.rows as any[];

  return {
    total_users: users.length,
    admin_count: users.filter(u => u.role === 'admin').length,
    banned_count: users.filter(u => u.is_banned === 1 || u.is_banned === true).length,
    total_posts: posts.filter(p => !p.is_deleted).length,
    flagged_posts: posts.filter(p => p.is_flagged && !p.is_deleted).length,
    deleted_posts: posts.filter(p => p.is_deleted).length,
    total_resources: resources.filter(r => !r.is_deleted).length,
    total_news: news.filter(n => !n.is_deleted).length,
  };
}

export async function getAllResourcesAdmin(): Promise<Resource[]> {
  const rs = await turso.execute(`
    SELECT r.*, u.username AS uploader_username
    FROM resources r
    LEFT JOIN users u ON u.id = r.uploaded_by
    ORDER BY r.created_at DESC
  `);
  return rs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) }));
}

export async function getAllNewsAdmin(): Promise<NewsItem[]> {
  const rs = await turso.execute(`
    SELECT n.*, u.username AS author_username
    FROM news n
    LEFT JOIN users u ON u.id = n.posted_by
    ORDER BY n.created_at DESC
  `);
  return rs.rows.map((r: any) => ({ ...r, is_deleted: Boolean(r.is_deleted) }));
}

export async function updateResource(id: string, data: Partial<{ title: string; description: string; is_deleted: number }>): Promise<void> {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const setClauses = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (data as any)[k]);
  await turso.execute({
    sql: `UPDATE resources SET ${setClauses} WHERE id = ?`,
    args: [...values, id]
  });
}

export async function updateNews(id: string, data: Partial<{ title: string; content: string; is_deleted: number }>): Promise<void> {
  const keys = Object.keys(data);
  if (keys.length === 0) return;
  const setClauses = keys.map(k => `${k} = ?`).join(', ');
  const values = keys.map(k => (data as any)[k]);
  await turso.execute({
    sql: `UPDATE news SET ${setClauses} WHERE id = ?`,
    args: [...values, id]
  });
}

export async function addAdminLog(adminId: string | null, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}): Promise<void> {
  await logAdminAction(adminId, action, targetType, targetId, metadata);
}