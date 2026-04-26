import type { APIRoute } from 'astro';
import { sendMessage, getUserByUsername, createNotification } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const { receiverUsername, content } = await request.json();
    if (!receiverUsername || !content) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
    }

    const receiver = getUserByUsername(receiverUsername);
    if (!receiver) {
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
    }

    const msg = sendMessage(locals.user.id, receiver.id, content.trim());
    
    // Create a notification for the receiver
    createNotification(receiver.id, `@${locals.user.username} sent you a message.`, `/messages/${locals.user.username}`);

    return new Response(JSON.stringify({ success: true, message: msg }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to send message' }), { status: 500 });
  }
};
