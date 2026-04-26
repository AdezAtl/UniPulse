import type { APIRoute } from 'astro';
import { addVote, removeVote } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { postId, value } = body;
  if (!postId || typeof value !== 'number') return err('Invalid request.');

  if (value === 0) {
    removeVote(locals.user.id, postId);
  } else {
    addVote(locals.user.id, postId, value);
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
