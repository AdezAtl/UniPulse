import type { APIRoute } from 'astro';
import { getUserByUsername, markMessagesRead } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const { senderUsername } = await request.json();
    if (!senderUsername) {
      return new Response(JSON.stringify({ error: 'Missing field' }), { status: 400 });
    }

    const sender = getUserByUsername(senderUsername);
    if (!sender) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    markMessagesRead(sender.id, locals.user.id);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to mark messages read' }), { status: 500 });
  }
};
