import { createBrowserClient } from '@supabase/ssr';

const url = "https://otarpbraezmbyhigcnra.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YXJwYnJhZXptYnloaWdjbnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDc0NzcsImV4cCI6MjA4OTU4MzQ3N30.C2Yx25ZJIyoWTIMxdzlPRlEckoXS4tgniCnEcj6n8QM";
const supabase = createBrowserClient(url, key);
async function fetchFeedPosts(limit = 40) {
  return supabase.from("posts_with_meta").select("*").order("created_at", { ascending: false }).limit(limit);
}
async function fetchUserPosts(userId) {
  return supabase.from("posts_with_meta").select("*").eq("author_id", userId).order("created_at", { ascending: false });
}
async function getTodayPostCount(userId) {
  const midnight = /* @__PURE__ */ new Date();
  midnight.setHours(0, 0, 0, 0);
  const { count } = await supabase.from("posts").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("is_deleted", false).gte("created_at", midnight.toISOString());
  return count ?? 0;
}
async function getLastPostTime(userId) {
  const { data } = await supabase.from("posts").select("created_at").eq("user_id", userId).eq("is_deleted", false).order("created_at", { ascending: false }).limit(1).single();
  return data ? new Date(data.created_at) : null;
}
async function fetchLikedPostIds(userId) {
  const { data } = await supabase.from("likes").select("post_id").eq("user_id", userId);
  return data?.map((l) => l.post_id) ?? [];
}
async function fetchResources() {
  return supabase.from("resources").select(`*, uploader:uploaded_by(username, pulse_id)`).eq("is_deleted", false).order("created_at", { ascending: false });
}
async function fetchNews() {
  return supabase.from("news").select(`*, author:posted_by(username)`).eq("is_deleted", false).order("created_at", { ascending: false });
}
async function createNews(title, content, postedBy) {
  return supabase.from("news").insert({ title, content, posted_by: postedBy }).select().single();
}
async function fetchAdminStats() {
  const [users, posts, resources, news] = await Promise.all([
    supabase.from("users").select("id, role, is_banned"),
    supabase.from("posts").select("id, is_flagged, is_deleted"),
    supabase.from("resources").select("id", { count: "exact", head: true }),
    supabase.from("news").select("id", { count: "exact", head: true })
  ]);
  return {
    totalUsers: users.data?.length ?? 0,
    adminCount: users.data?.filter((u) => u.role === "admin").length ?? 0,
    bannedCount: users.data?.filter((u) => u.is_banned).length ?? 0,
    totalPosts: posts.data?.length ?? 0,
    flaggedPosts: posts.data?.filter((p) => p.is_flagged && !p.is_deleted).length ?? 0,
    deletedPosts: posts.data?.filter((p) => p.is_deleted).length ?? 0,
    totalResources: resources.count ?? 0,
    totalNews: news.count ?? 0
  };
}
async function fetchAllUsers() {
  return supabase.from("users").select("id,username,pulse_id,full_name,department,level,role,is_banned,created_at").order("created_at", { ascending: false });
}
async function fetchAdminPosts(limit = 60) {
  return supabase.from("admin_posts_view").select("*").order("created_at", { ascending: false }).limit(limit);
}
async function fetchAdminLogs(limit = 60) {
  return supabase.from("admin_logs").select(`*, admin:admin_id(username, pulse_id)`).order("created_at", { ascending: false }).limit(limit);
}
async function fetchAdminResources() {
  return supabase.from("resources").select(`*, uploader:uploaded_by(username)`).order("created_at", { ascending: false });
}
async function fetchAdminNews() {
  return supabase.from("news").select(`*, author:posted_by(username)`).order("created_at", { ascending: false });
}

export { fetchAllUsers as a, fetchAdminPosts as b, fetchAdminLogs as c, fetchAdminResources as d, fetchAdminNews as e, fetchAdminStats as f, fetchFeedPosts as g, fetchLikedPostIds as h, getTodayPostCount as i, getLastPostTime as j, createNews as k, fetchNews as l, fetchUserPosts as m, fetchResources as n, supabase as s };
