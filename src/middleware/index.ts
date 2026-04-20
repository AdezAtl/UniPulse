// src/middleware/index.ts
import { defineMiddleware } from 'astro:middleware';
import { getSessionUser } from '../lib/db';
import { COOKIE_NAME, COOKIE_MAX_AGE } from '../lib/auth';

const PROTECTED = ['/feed', '/profile', '/resources', '/news', '/admin', '/settings'];
const ADMIN_ONLY = ['/admin'];
const AUTH_PAGES = ['/login', '/signup'];

export const onRequest = defineMiddleware(async ({ request, cookies, redirect, locals }, next) => {
  const path = new URL(request.url).pathname;
  const token = cookies.get(COOKIE_NAME)?.value ?? null;

  locals.user = null;
  locals.isAdmin = false;
  locals.sessionToken = token;

  if (token) {
    const user = getSessionUser(token); // also slides the 3-day inactivity window

    if (user) {
      locals.user = user;
      locals.isAdmin = user.role === 'admin';

      // Re-issue cookie to slide the 3-day expiry on every request
      cookies.set(COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: COOKIE_MAX_AGE,
      });
    } else {
      // Session expired or invalid — clear the stale cookie
      cookies.delete(COOKIE_NAME, { path: '/' });
    }
  }

  // Already logged in → skip auth pages
  if (locals.user && AUTH_PAGES.some(r => path.startsWith(r))) {
    return redirect('/feed');
  }

  // Not logged in → protect app routes
  if (!locals.user && PROTECTED.some(r => path.startsWith(r))) {
    return redirect(`/login?redirect=${encodeURIComponent(path)}`);
  }

  // Admin-only routes
  if (locals.user && ADMIN_ONLY.some(r => path.startsWith(r)) && !locals.isAdmin) {
    return redirect('/feed?error=unauthorized');
  }

  return next();
});