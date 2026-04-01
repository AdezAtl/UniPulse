import { defineMiddleware } from 'astro:middleware';
import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { Database } from '../lib/database.types';

const PROTECTED  = ['/feed', '/profile', '/resources', '/news', '/admin', '/settings'];
const ADMIN_ONLY = ['/admin']; // must always be a subset of PROTECTED
const AUTH_PAGES = ['/login', '/signup'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { request, cookies, redirect, locals } = context;

  // ✅ Guard against missing env variables
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables: PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are required.');
  }

  // ✅ Use createServerClient from @supabase/ssr — the ONLY package that
  //    supports the `cookies` option. createClient from @supabase/supabase-js
  //    does NOT have this option, which caused TS error 2353.
  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        // ✅ parseCookieHeader from @supabase/ssr handles parsing correctly
        return parseCookieHeader(request.headers.get('cookie') ?? '');
      },
      // ✅ Explicit types on cookiesToSet — eliminates TS 7006 / 7031 implicit any errors
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookies.set(name, value, { ...(options as object), path: '/' });
        });
      },
    },
  });

  // ✅ getUser() validates the JWT server-side — more secure than getSession()
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

  if (authError && authError.message !== 'Auth session missing!') {
    console.error('[middleware] Auth error:', authError.message);
  }

  const path = new URL(request.url).pathname;

  // ✅ Set safe defaults before any branching (also fixes TS 2339 on locals)
  locals.supabase = supabase;
  locals.user     = null;
  locals.isAdmin  = false;

  // Redirect logged-in users away from auth pages
  if (authUser && AUTH_PAGES.some(r => path.startsWith(r))) {
    return redirect('/feed');
  }

  // Redirect unauthenticated users away from protected pages
  if (!authUser && PROTECTED.some(r => path.startsWith(r))) {
    return redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  if (authUser) {
    // ✅ No spaces after commas in the select string — spaces cause Supabase to
    //    return a `SelectQueryError` union type, which is why is_banned / role /
    //    is_deleted etc. were failing (TS 2339). Removing spaces fixes the return type.
    const { data: user, error: dbError } = await supabase
      .from('users')
      .select('id,username,pulse_id,full_name,role,is_banned,is_flagged,is_deleted,department,level,avatar_url')
      .eq('id', authUser.id)
      .single();

    if (dbError) {
      console.error('[middleware] Failed to fetch user profile:', dbError.message);
      return redirect('/login?error=server');
    }

    // After the dbError guard, `user` is now the fully typed row — safe to access
    if (user) {
      if (user.is_banned || user.is_deleted) {
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