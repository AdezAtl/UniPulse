import type { APIRoute } from 'astro';
import { createComment } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { postId, content } = body;
  if (!postId || !content || content.trim().length === 0) return err('Invalid request.');

  createComment(postId, locals.user.id, content.trim());

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
