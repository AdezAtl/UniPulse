import type { APIRoute } from 'astro';
import { addLike, removeLike } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { postId, action } = body;
  if (!postId || !['like', 'unlike'].includes(action)) return err('Invalid request.');

  if (action === 'like') addLike(locals.user.id, postId);
  else removeLike(locals.user.id, postId);

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}