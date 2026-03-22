import type { APIRoute } from 'astro';
import { getTodayPostCount, getLastPostTime } from '../../lib/supabase';
import { getCooldownRemaining, DAILY_POST_LIMIT } from '../../lib/utils';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const { content } = await request.json().catch(() => ({}));
  if (!content || typeof content !== 'string') return json({ error: 'Content is required.' }, 400);

  const trimmed = content.trim();
  if (!trimmed)        return json({ error: 'Post cannot be empty.' }, 400);
  if (trimmed.length > 280) return json({ error: 'Post exceeds 280 characters.' }, 400);

  const [todayCount, lastPost] = await Promise.all([
    getTodayPostCount(user.id),
    getLastPostTime(user.id),
  ]);

  if (todayCount >= DAILY_POST_LIMIT) {
    return json({ error: "You've reached your daily post limit. Come back tomorrow!" }, 429);
  }

  const cooldown = getCooldownRemaining(lastPost);
  if (cooldown > 0) {
    const mins = Math.ceil(cooldown / 60);
    return json({ error: `Please wait ${mins} more minute${mins !== 1 ? 's' : ''} before posting again.` }, 429);
  }

  const { error } = await locals.supabase.from('posts').insert({ user_id: user.id, content: trimmed });
  if (error) return json({ error: error.message }, 500);
  return json({ success: true }, 201);
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
