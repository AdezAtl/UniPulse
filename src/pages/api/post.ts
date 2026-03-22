import type { APIRoute } from 'astro';

const DAILY_LIMIT   = 5;
const COOLDOWN_SECS = 15 * 60;

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: any = {};
  try { body = await request.json(); } catch {}

  const content = (body?.content ?? '').trim();
  if (!content)          return err('Post cannot be empty.');
  if (content.length > 280) return err('Post exceeds 280 characters.');

  const userId = locals.user.id;
  const sb     = locals.supabase;

  // Daily limit check
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);

  const { count } = await sb
    .from('posts')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .gte('created_at', midnight.toISOString());

  if ((count ?? 0) >= DAILY_LIMIT) {
    return err("You've reached your daily post limit. Come back tomorrow!", 429);
  }

  // Cooldown check
  const { data: rows } = await sb
    .from('posts')
    .select('created_at')
    .eq('user_id', userId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(1);

  if (rows && rows.length > 0) {
    const elapsed = (Date.now() - new Date(rows[0].created_at).getTime()) / 1000;
    if (elapsed < COOLDOWN_SECS) {
      const mins = Math.ceil((COOLDOWN_SECS - elapsed) / 60);
      return err(`Please wait ${mins} more minute${mins !== 1 ? 's' : ''} before posting again.`, 429);
    }
  }

  // Insert
  const { error } = await sb
    .from('posts')
    .insert({ user_id: userId, content });

  if (error) return err(error.message, 500);

  return new Response(JSON.stringify({ success: true }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}