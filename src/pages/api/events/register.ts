import type { APIRoute } from 'astro';
import { toggleEventRegistration } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  try {
    const { eventId } = await request.json();
    if (!eventId) return new Response(JSON.stringify({ error: 'Missing event ID' }), { status: 400 });
    
    const registered = toggleEventRegistration(locals.user.id, eventId);
    return new Response(JSON.stringify({ registered }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
  }
};
