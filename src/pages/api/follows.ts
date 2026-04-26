import type { APIRoute } from 'astro';
import { toggleFollow, createNotification } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { followingId } = body;
  if (!followingId) return err('Invalid request.');

  const following = toggleFollow(locals.user.id, followingId);
  if (following) {
    createNotification(followingId, `u/${locals.user.username} started following you`, `/profile/${locals.user.username}`);
  }

  return new Response(JSON.stringify({ success: true, following }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
