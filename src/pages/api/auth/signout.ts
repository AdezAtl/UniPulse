import type { APIRoute } from 'astro';
import { deleteSession } from '../../../lib/db';
import { COOKIE_NAME } from '../../../lib/auth';

export const POST: APIRoute = async ({ cookies, redirect }) => {
  const token = cookies.get(COOKIE_NAME)?.value;
  if (token) deleteSession(token);
  cookies.delete(COOKIE_NAME, { path: '/' });
  return redirect('/login');
};