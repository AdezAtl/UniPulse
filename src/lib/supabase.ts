import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const url = import.meta.env.PUBLIC_SUPABASE_URL  as string;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

// createBrowserClient stores the session in cookies (not localStorage),
// so the server-side middleware can read it on every request.
export const supabase = createBrowserClient<Database>(url, key);

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabase.from('users').select('*').eq('id', session.user.id).single();
  return data;
}

export async function signUp(email: string, password: string, profile: {
  username: string; department: string; level: string; full_name?: string;
}) {
  const pulse_id = 'UP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError || !authData.user) return { error: authError?.message ?? 'Signup failed' };

  const { error: profileError } = await supabase.from('users').insert({
    id: authData.user.id, email, username: profile.username, pulse_id,
    full_name: profile.full_name ?? null, department: profile.department,
    level: profile.level, role: 'user', is_banned: false,
  });
  if (profileError) return { error: profileError.message };
  return { data: authData };
}

export async function signIn(identifier: string, password: string) {
  let email = identifier;
  if (!identifier.includes('@')) {
    const col = identifier.toUpperCase().startsWith('UP-') ? 'pulse_id' : 'username';
    const { data: user, error } = await supabase.from('users').select('email').eq(col, identifier).single();
    if (error || !user) return { error: 'User not found' };
    email = user.email;
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { data };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function fetchFeedPosts(limit = 40) {
  return supabase.from('posts_with_meta').select('*').order('created_at', { ascending: false }).limit(limit);
}

export async function fetchUserPosts(userId: string) {
  return supabase.from('posts_with_meta').select('*').eq('author_id', userId).order('created_at', { ascending: false });
}

export async function getTodayPostCount(userId: string): Promise<number> {
  const midnight = new Date(); midnight.setHours(0, 0, 0, 0);
  const { count } = await supabase.from('posts').select('*', { count: 'exact', head: true })
    .eq('user_id', userId).eq('is_deleted', false).gte('created_at', midnight.toISOString());
  return count ?? 0;
}

export async function getLastPostTime(userId: string): Promise<Date | null> {
  const { data } = await supabase.from('posts').select('created_at')
    .eq('user_id', userId).eq('is_deleted', false)
    .order('created_at', { ascending: false }).limit(1).single();
  return data ? new Date(data.created_at) : null;
}

export async function fetchLikedPostIds(userId: string): Promise<string[]> {
  const { data } = await supabase.from('likes').select('post_id').eq('user_id', userId);
  return data?.map(l => l.post_id) ?? [];
}

export async function fetchResources() {
  return supabase.from('resources').select(`*, uploader:uploaded_by(username, pulse_id)`)
    .eq('is_deleted', false).order('created_at', { ascending: false });
}

export async function fetchNews() {
  return supabase.from('news').select(`*, author:posted_by(username)`)
    .eq('is_deleted', false).order('created_at', { ascending: false });
}

export async function createNews(title: string, content: string, postedBy: string) {
  return supabase.from('news').insert({ title, content, posted_by: postedBy }).select().single();
}

export async function fetchAdminStats() {
  const [users, posts, resources, news] = await Promise.all([
    supabase.from('users').select('id, role, is_banned'),
    supabase.from('posts').select('id, is_flagged, is_deleted'),
    supabase.from('resources').select('id', { count: 'exact', head: true }),
    supabase.from('news').select('id', { count: 'exact', head: true }),
  ]);
  return {
    totalUsers:     users.data?.length ?? 0,
    adminCount:     users.data?.filter(u => u.role === 'admin').length ?? 0,
    bannedCount:    users.data?.filter(u => u.is_banned).length ?? 0,
    totalPosts:     posts.data?.length ?? 0,
    flaggedPosts:   posts.data?.filter(p => p.is_flagged && !p.is_deleted).length ?? 0,
    deletedPosts:   posts.data?.filter(p => p.is_deleted).length ?? 0,
    totalResources: resources.count ?? 0,
    totalNews:      news.count ?? 0,
  };
}

export async function fetchAllUsers() {
  return supabase.from('users')
    .select('id,username,pulse_id,full_name,department,level,role,is_banned,created_at')
    .order('created_at', { ascending: false });
}

export async function fetchAdminPosts(limit = 60) {
  return supabase.from('admin_posts_view').select('*').order('created_at', { ascending: false }).limit(limit);
}

export async function fetchAdminLogs(limit = 60) {
  return supabase.from('admin_logs').select(`*, admin:admin_id(username, pulse_id)`)
    .order('created_at', { ascending: false }).limit(limit);
}

export async function fetchAdminResources() {
  return supabase.from('resources').select(`*, uploader:uploaded_by(username)`).order('created_at', { ascending: false });
}

export async function fetchAdminNews() {
  return supabase.from('news').select(`*, author:posted_by(username)`).order('created_at', { ascending: false });
}