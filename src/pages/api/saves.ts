import type { APIRoute } from 'astro';
import { toggleSavedPost } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { postId } = body;
  if (!postId) return err('Invalid request.');

  const saved = toggleSavedPost(locals.user.id, postId);

  return new Response(JSON.stringify({ success: true, saved }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
