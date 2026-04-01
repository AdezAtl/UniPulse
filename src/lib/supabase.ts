import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

const url = import.meta.env.PUBLIC_SUPABASE_URL  as string;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;

if (!url || !key) throw new Error('Missing Supabase env variables.');

// ✅ createBrowserClient (from @supabase/ssr) stores the session in cookies,
//    not localStorage — this is what allows the middleware's createServerClient
//    to read the session server-side and not redirect back to /login.
export const supabase = createBrowserClient<Database>(url, key);

// ── Auth ──────────────────────────────────────────────────────────────────────

// ✅ getSession() is acceptable on the CLIENT side (browser only).
//    Never use it server-side / in middleware — use getUser() there instead.
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return data;
}

export async function signUp(
  email: string,
  password: string,
  profile: { username: string; department: string; level: string; full_name?: string | undefined  }
) {
  const pulse_id = 'UP-' + Math.random().toString(36).slice(2, 8).toUpperCase();

  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError)      return { error: authError.message };
  if (!authData.user) return { error: 'Signup failed — no user returned.' };

  const { error: profileError } = await supabase.rpc('create_user_profile', {
    p_id:         authData.user.id,
    p_email:      email,
    p_username:   profile.username,
    p_pulse_id:   pulse_id,
    // ✅ Pass null instead of empty string — matches `p_full_name` RPC param type
    //    of `string | null`. An empty string is misleading; null means "not set".
    p_full_name:  profile.full_name,
    p_department: profile.department,
    p_level:      profile.level,
  });

  if (profileError) {
    await supabase.auth.signOut();
    return { error: profileError.message };
  }

  return { data: authData };
}

export async function signIn(identifier: string, password: string) {
  let email = identifier;

  if (!identifier.includes('@')) {
    const col = identifier.toUpperCase().startsWith('UP-') ? 'pulse_id' : 'username';
    const { data: user, error } = await supabase
      .from('users')
      .select('email')
      .eq(col, identifier)
      .single();

    if (error || !user) return { error: 'User not found.' };
    email = user.email;
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  return { data };
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ── Posts ─────────────────────────────────────────────────────────────────────

export async function fetchFeedPosts(limit = 40) {
  return supabase
    .from('posts_with_meta')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function fetchUserPosts(userId: string) {
  return supabase
    .from('posts_with_meta')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });
}

export async function getTodayPostCount(userId: string): Promise<number> {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .gte('created_at', midnight.toISOString());
  return count ?? 0;
}

export async function getLastPostTime(userId: string): Promise<Date | null> {
  const { data } = await supabase
    .from('posts')
    .select('created_at')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data ? new Date(data.created_at) : null;
}

export async function fetchLikedPostIds(userId: string): Promise<string[]> {
  const { data } = await supabase
    .from('likes')
    .select('post_id')
    .eq('user_id', userId);
  return data?.map(l => l.post_id) ?? [];
}

// ── Resources ─────────────────────────────────────────────────────────────────

export async function fetchResources() {
  return supabase
    .from('resources')
    .select('*, uploader:uploaded_by(username, pulse_id)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
}

// ── News ──────────────────────────────────────────────────────────────────────

export async function fetchNews() {
  return supabase
    .from('news')
    .select('*, author:posted_by(username)')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
}

export async function createNews(title: string, content: string, postedBy: string) {
  return supabase
    .from('news')
    .insert({ title, content, posted_by: postedBy })
    .select()
    .single();
}

// ── Admin helpers ─────────────────────────────────────────────────────────────

// ✅ Use separate count queries instead of fetching ALL rows just to .length them.
//    The previous approach pulled every user/post record over the wire — this
//    lets Postgres do the counting and only returns numbers.
export async function fetchAdminStats() {
  const [
    { count: totalUsers },
    { count: adminCount },
    { count: bannedCount },
    { count: totalPosts },
    { count: flaggedPosts },
    { count: deletedPosts },
    { count: totalResources },
    { count: totalNews },
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_banned', true),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_flagged', true).eq('is_deleted', false),
    supabase.from('posts').select('*', { count: 'exact', head: true }).eq('is_deleted', true),
    supabase.from('resources').select('*', { count: 'exact', head: true }),
    supabase.from('news').select('*', { count: 'exact', head: true }),
  ]);

  return {
    totalUsers:     totalUsers     ?? 0,
    adminCount:     adminCount     ?? 0,
    bannedCount:    bannedCount    ?? 0,
    totalPosts:     totalPosts     ?? 0,
    flaggedPosts:   flaggedPosts   ?? 0,
    deletedPosts:   deletedPosts   ?? 0,
    totalResources: totalResources ?? 0,
    totalNews:      totalNews      ?? 0,
  };
}

export async function fetchAllUsers() {
  return supabase
    .from('users')
    .select('id,username,pulse_id,full_name,department,level,role,is_banned,created_at')
    .order('created_at', { ascending: false });
}

export async function fetchAdminPosts(limit = 60) {
  return supabase
    .from('admin_posts_view')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function fetchAdminLogs(limit = 60) {
  return supabase
    .from('admin_logs')
    .select('*, admin:admin_id(username, pulse_id)')
    .order('created_at', { ascending: false })
    .limit(limit);
}

export async function fetchAdminResources() {
  return supabase
    .from('resources')
    .select('*, uploader:uploaded_by(username)')
    .order('created_at', { ascending: false });
}

export async function fetchAdminNews() {
  return supabase
    .from('news')
    .select('*, author:posted_by(username)')
    .order('created_at', { ascending: false });
}