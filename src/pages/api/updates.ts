import type { APIRoute } from 'astro';
import { getUpdates } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const updates = await getUpdates(locals.user.id);
    return new Response(JSON.stringify(updates), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
  }
};
