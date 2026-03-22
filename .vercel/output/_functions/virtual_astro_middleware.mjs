import { a6 as defineMiddleware, af as sequence } from './chunks/sequence_B8w407xz.mjs';
import 'piccolore';
import 'clsx';
import { createServerClient } from '@supabase/ssr';

const PROTECTED = ["/feed", "/profile", "/resources", "/news", "/admin"];
const ADMIN_ONLY = ["/admin"];
const AUTH_PAGES = ["/login", "/signup"];
const onRequest$1 = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, locals } = context;
  const supabase = createServerClient(
    "https://otarpbraezmbyhigcnra.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90YXJwYnJhZXptYnloaWdjbnJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwMDc0NzcsImV4cCI6MjA4OTU4MzQ3N30.C2Yx25ZJIyoWTIMxdzlPRlEckoXS4tgniCnEcj6n8QM",
    {
      cookies: {
        // Parse cookies from the raw request header — Astro doesn't have getAll()
        getAll: () => {
          const header = request.headers.get("cookie") ?? "";
          if (!header) return [];
          return header.split(";").map((c) => {
            const [name, ...rest] = c.trim().split("=");
            return { name: name.trim(), value: rest.join("=") };
          });
        },
        // Write cookies back using Astro's cookies.set()
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, { ...options, path: "/" });
          });
        }
      }
    }
  );
  const { data: { session } } = await supabase.auth.getSession();
  const path = new URL(request.url).pathname;
  if (session && AUTH_PAGES.some((r) => path.startsWith(r))) return redirect("/feed");
  if (!session && PROTECTED.some((r) => path.startsWith(r))) return redirect(`/login?redirect=${encodeURIComponent(path)}`);
  locals.supabase = supabase;
  locals.user = null;
  locals.isAdmin = false;
  if (session) {
    const { data: user } = await supabase.from("users").select("id,username,pulse_id,full_name,role,is_banned,department,level,avatar_url").eq("id", session.user.id).single();
    if (user) {
      if (user.is_banned) {
        await supabase.auth.signOut();
        return redirect("/login?error=banned");
      }
      locals.user = user;
      locals.isAdmin = user.role === "admin";
    }
    if (ADMIN_ONLY.some((r) => path.startsWith(r)) && !locals.isAdmin) {
      return redirect("/feed?error=unauthorized");
    }
  }
  return next();
});

const onRequest = sequence(
	
	onRequest$1
	
);

export { onRequest };
