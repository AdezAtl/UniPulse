import { defineMiddleware } from 'astro:middleware';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '../lib/database.types';

const PROTECTED  = ['/feed', '/profile', '/resources', '/news', '/admin'];
const ADMIN_ONLY = ['/admin'];
const AUTH_PAGES = ['/login', '/signup'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, locals } = context;

  const supabase = createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        // Parse cookies from the raw request header — Astro doesn't have getAll()
        getAll: () => {
          const header = request.headers.get('cookie') ?? '';
          if (!header) return [];
          return header.split(';').map(c => {
            const [name, ...rest] = c.trim().split('=');
            return { name: name.trim(), value: rest.join('=') };
          });
        },
        // Write cookies back using Astro's cookies.set()
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookies.set(name, value, { ...options, path: '/' });
          });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const path = new URL(request.url).pathname;

  if (session && AUTH_PAGES.some(r => path.startsWith(r)))  return redirect('/feed');
  if (!session && PROTECTED.some(r => path.startsWith(r)))  return redirect(`/login?redirect=${encodeURIComponent(path)}`);

  locals.supabase = supabase;
  locals.user     = null;
  locals.isAdmin  = false;

  if (session) {
    const { data: user } = await supabase
      .from('users')
      .select('id,username,pulse_id,full_name,role,is_banned,department,level,avatar_url')
      .eq('id', session.user.id)
      .single();

    if (user) {
      if (user.is_banned) {
        await supabase.auth.signOut();
        return redirect('/login?error=banned');
      }
      locals.user    = user;
      locals.isAdmin = user.role === 'admin';
    }

    if (ADMIN_ONLY.some(r => path.startsWith(r)) && !locals.isAdmin) {
      return redirect('/feed?error=unauthorized');
    }
  }

  return next();
});