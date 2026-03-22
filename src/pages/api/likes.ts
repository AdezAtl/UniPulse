import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: 'Unauthorized' }, 401);

  const body = await request.json().catch(() => ({}));
  const { postId, action } = body;

  if (!postId || !['like', 'unlike'].includes(action))
    return json({ error: 'Invalid request.' }, 400);

  if (action === 'like') {
    const { error } = await locals.supabase
      .from('likes')
      .insert({ user_id: user.id, post_id: postId });
    if (error && !error.message.includes('duplicate'))
      return json({ error: error.message }, 500);
  } else {
    const { error } = await locals.supabase
      .from('likes')
      .delete()
      .eq('user_id', user.id)
      .eq('post_id', postId);
    if (error) return json({ error: error.message }, 500);
  }

  return json({ success: true });
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });