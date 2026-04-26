import type { APIRoute } from 'astro';
import { markNotificationsRead } from '../../../lib/db';

export const POST: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(null, { status: 401 });
  
  markNotificationsRead(locals.user.id);

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};
