import type { APIRoute } from 'astro';
import { getTodayPostCount, getLastPostTime, createPost } from '../../lib/db';
import { DAILY_POST_LIMIT, getCooldownRemaining } from '../../lib/utils';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const content = (body?.content ?? '').trim();
  if (!content) return err('Post cannot be empty.');
  if (content.length > 280) return err('Post exceeds 280 characters.');

  const userId = locals.user.id;
  const count = getTodayPostCount(userId);
  if (count >= DAILY_POST_LIMIT) return err("You've reached your daily post limit. Come back tomorrow!", 429);

  const lastPost = getLastPostTime(userId);
  const cooldown = getCooldownRemaining(lastPost);
  if (cooldown > 0) {
    const mins = Math.ceil(cooldown / 60);
    return err(`Please wait ${mins} more minute${mins !== 1 ? 's' : ''} before posting again.`, 429);
  }

  createPost(userId, content);
  return new Response(JSON.stringify({ success: true }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}