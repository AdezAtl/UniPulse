// src/lib/db.ts
// Client adapter querying the separate Node/Express backend server via RPC.

const BACKEND_URL = import.meta.env.BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:3000';
const INTERNAL_API_KEY = import.meta.env.INTERNAL_API_KEY || process.env.INTERNAL_API_KEY || '';

// ── RPC Client Helper ────────────────────────────────────────────────────────
async function callBackend(method: string, args: any[] = []) {
  try {
    const res = await fetch(`${BACKEND_URL}/rpc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': INTERNAL_API_KEY,
      },
      body: JSON.stringify({ method, args }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown server error' }));
      throw new Error(err.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.result;
  } catch (err: any) {
    console.error(`🔴 API Client Error during call to backend '${method}':`, err.message);
    throw err;
  }
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

// ── User queries ──────────────────────────────────────────────────────────────

export async function getUserById(id: string): Promise<User | null> {
  return callBackend('getUserById', [id]);
}

export async function getUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  return callBackend('getUserByEmail', [email]);
}

export async function getUserByUsername(username: string): Promise<(User & { password_hash: string }) | null> {
  return callBackend('getUserByUsername', [username]);
}

export async function getUserByPulseId(pulseId: string): Promise<(User & { password_hash: string }) | null> {
  return callBackend('getUserByPulseId', [pulseId]);
}

export async function createUser(data: {
  id: string; email: string; username: string; pulse_id: string;
  password_hash: string; full_name: string | null;
  department: string; level: string;
}): Promise<User> {
  return callBackend('createUser', [data]);
}

export async function updateUser(id: string, data: Partial<{
  username: string; full_name: string | null; department: string; level: string; avatar_url: string | null;
}>): Promise<void> {
  return callBackend('updateUser', [id, data]);
}

export async function updateUserPassword(id: string, password_hash: string): Promise<void> {
  return callBackend('updateUserPassword', [id, password_hash]);
}

export async function setUserRole(id: string, role: UserRole): Promise<void> {
  return callBackend('setUserRole', [id, role]);
}

export async function setUserBanned(id: string, banned: boolean): Promise<void> {
  return callBackend('setUserBanned', [id, banned]);
}

export async function getAllUsers(): Promise<User[]> {
  return callBackend('getAllUsers');
}

export async function getPasswordHash(userId: string): Promise<string | null> {
  return callBackend('getPasswordHash', [userId]);
}

// ── Session queries ───────────────────────────────────────────────────────────

export async function createSession(userId: string): Promise<string> {
  return callBackend('createSession', [userId]);
}

export async function getSessionUser(token: string): Promise<User | null> {
  return callBackend('getSessionUser', [token]);
}

export async function deleteSession(token: string): Promise<void> {
  return callBackend('deleteSession', [token]);
}

export async function deleteAllUserSessions(userId: string): Promise<void> {
  return callBackend('deleteAllUserSessions', [userId]);
}

// ── Post queries ──────────────────────────────────────────────────────────────

export async function getFeedPosts(limit?: number): Promise<PostWithMeta[]> {
  return callBackend('getFeedPosts', [limit]);
}

export async function getUserPosts(userId: string): Promise<PostWithMeta[]> {
  return callBackend('getUserPosts', [userId]);
}

export async function getPostById(postId: string): Promise<PostWithMeta | null> {
  return callBackend('getPostById', [postId]);
}

export async function getAllPostsAdmin(limit?: number): Promise<PostWithMeta[]> {
  return callBackend('getAllPostsAdmin', [limit]);
}

export async function createPost(userId: string, content: string, mediaUrl: string | null = null): Promise<Post> {
  return callBackend('createPost', [userId, content, mediaUrl]);
}

export async function getTodayPostCount(userId: string): Promise<number> {
  return callBackend('getTodayPostCount', [userId]);
}

export async function getLastPostTime(userId: string): Promise<Date | null> {
  const ts = await callBackend('getLastPostTime', [userId]);
  return ts ? new Date(ts) : null;
}

export async function updatePost(id: string, data: Partial<{ content: string; is_flagged: number; is_deleted: number }>): Promise<void> {
  return callBackend('updatePost', [id, data]);
}

// ── Vote queries ──────────────────────────────────────────────────────────────

export async function getUserVotes(userId: string): Promise<Record<string, number>> {
  return callBackend('getUserVotes', [userId]);
}

export async function getLikedPostIds(userId: string): Promise<string[]> {
  return callBackend('getLikedPostIds', [userId]);
}

export async function addVote(userId: string, postId: string, value: number): Promise<void> {
  return callBackend('addVote', [userId, postId, value]);
}

export async function removeVote(userId: string, postId: string): Promise<void> {
  return callBackend('removeVote', [userId, postId]);
}

export async function addLike(userId: string, postId: string): Promise<void> {
  return callBackend('addLike', [userId, postId]);
}

export async function removeLike(userId: string, postId: string): Promise<void> {
  return callBackend('removeLike', [userId, postId]);
}

// ── Comment queries ───────────────────────────────────────────────────────────

export async function getPostComments(postId: string): Promise<Comment[]> {
  return callBackend('getPostComments', [postId]);
}

export async function createComment(postId: string, userId: string, content: string): Promise<Comment> {
  return callBackend('createComment', [postId, userId, content]);
}

export async function getCommentCount(postId: string): Promise<number> {
  return callBackend('getCommentCount', [postId]);
}

// ── Save queries ──────────────────────────────────────────────────────────────

export async function getSavedPostIds(userId: string): Promise<Set<string>> {
  const arr = await callBackend('getSavedPostIds', [userId]);
  return new Set(arr);
}

export async function getSavedPosts(userId: string): Promise<PostWithMeta[]> {
  return callBackend('getSavedPosts', [userId]);
}

export async function toggleSavedPost(userId: string, postId: string): Promise<boolean> {
  return callBackend('toggleSavedPost', [userId, postId]);
}

// ── Follow queries ────────────────────────────────────────────────────────────

export async function getFollowingIds(userId: string): Promise<Set<string>> {
  const arr = await callBackend('getFollowingIds', [userId]);
  return new Set(arr);
}

export async function getFollowerIds(userId: string): Promise<string[]> {
  return callBackend('getFollowerIds', [userId]);
}

export async function toggleFollow(followerId: string, followingId: string): Promise<boolean> {
  return callBackend('toggleFollow', [followerId, followingId]);
}

// ── Notification queries ──────────────────────────────────────────────────────

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  return callBackend('getUserNotifications', [userId]);
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  return callBackend('getUnreadNotificationCount', [userId]);
}

export async function markNotificationsRead(userId: string): Promise<void> {
  return callBackend('markNotificationsRead', [userId]);
}

export async function createNotification(userId: string, message: string, link: string): Promise<void> {
  return callBackend('createNotification', [userId, message, link]);
}

// ── Resource queries ──────────────────────────────────────────────────────────

export async function getResources(): Promise<Resource[]> {
  return callBackend('getResources');
}

export async function getAllResourcesAdmin(): Promise<Resource[]> {
  return callBackend('getAllResourcesAdmin');
}

export async function createResource(data: {
  title: string; description: string | null;
  file_url: string | null; link_url: string | null; uploaded_by: string;
}): Promise<void> {
  return callBackend('createResource', [data]);
}

export async function updateResource(id: string, data: Partial<{ title: string; description: string; is_deleted: number }>): Promise<void> {
  return callBackend('updateResource', [id, data]);
}

// ── News queries ──────────────────────────────────────────────────────────────

export async function getNews(): Promise<NewsItem[]> {
  return callBackend('getNews');
}

export async function getAllNewsAdmin(): Promise<NewsItem[]> {
  return callBackend('getAllNewsAdmin');
}

export async function createNews(title: string, content: string, postedBy: string): Promise<void> {
  return callBackend('createNews', [title, content, postedBy]);
}

export async function updateNews(id: string, data: Partial<{ title: string; content: string; is_deleted: number }>): Promise<void> {
  return callBackend('updateNews', [id, data]);
}

// ── Admin log queries ─────────────────────────────────────────────────────────

export async function addAdminLog(adminId: string, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}): Promise<void> {
  return callBackend('addAdminLog', [adminId, action, targetType, targetId, metadata]);
}

export async function getAdminLogs(limit?: number): Promise<AdminLog[]> {
  return callBackend('getAdminLogs', [limit]);
}

// ── Admin stats ───────────────────────────────────────────────────────────────

export async function getAdminStats(): Promise<{
  totalUsers: number; adminCount: number; bannedCount: number;
  totalPosts: number; flaggedPosts: number; deletedPosts: number;
  totalResources: number; totalNews: number;
}> {
  return callBackend('getAdminStats');
}

// ── Events queries ────────────────────────────────────────────────────────────

export async function getEvents(): Promise<EventItem[]> {
  return callBackend('getEvents');
}

export async function getAllEventsAdmin(): Promise<EventItem[]> {
  return callBackend('getAllEventsAdmin');
}

export async function createEvent(title: string, description: string, event_date: string, location: string, postedBy: string, media_url: string | null = null): Promise<void> {
  return callBackend('createEvent', [title, description, event_date, location, postedBy, media_url]);
}

export async function updateEvent(id: string, data: Partial<{ title: string; description: string; event_date: string; location: string; is_deleted: number }>): Promise<void> {
  return callBackend('updateEvent', [id, data]);
}

export async function getRegisteredEvents(userId: string): Promise<EventItem[]> {
  return callBackend('getRegisteredEvents', [userId]);
}

export async function getRegisteredEventIds(userId: string): Promise<Set<string>> {
  const arr = await callBackend('getRegisteredEventIds', [userId]);
  return new Set(arr);
}

export async function toggleEventRegistration(userId: string, eventId: string): Promise<boolean> {
  return callBackend('toggleEventRegistration', [userId, eventId]);
}

// ── Global Search ─────────────────────────────────────────────────────────────

export async function searchAll(query: string, currentUserId: string): Promise<SearchResults> {
  return callBackend('searchAll', [query, currentUserId]);
}

// ── Direct Messaging ──────────────────────────────────────────────────────────

export async function getConversations(userId: string): Promise<Conversation[]> {
  return callBackend('getConversations', [userId]);
}

export async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
  return callBackend('getMessages', [userId1, userId2]);
}

export async function sendMessage(senderId: string, receiverId: string, content: string): Promise<Message> {
  return callBackend('sendMessage', [senderId, receiverId, content]);
}

export async function markMessagesRead(senderId: string, receiverId: string): Promise<void> {
  return callBackend('markMessagesRead', [senderId, receiverId]);
}

export async function getUpdates(userId: string): Promise<{
  unreadNotifications: number;
  unreadMessages: number;
  latestPostTime: string | null;
  latestNotifications: any[];
  latestMessages: any[];
}> {
  return callBackend('getUpdates', [userId]);
}

export function newId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}