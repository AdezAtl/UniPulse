import type { APIRoute } from 'astro';
import { getUnreadNotificationCount, db } from '../../lib/db';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const unreadNotifications = getUnreadNotificationCount(locals.user.id);
    
    // Count unread messages
    const msgRow = db.prepare(`SELECT COUNT(*) as c FROM messages WHERE receiver_id = ? AND is_read = 0`).get(locals.user.id) as any;
    const unreadMessages = msgRow?.c || 0;

    // Get timestamp of the newest post
    const postRow = db.prepare(`SELECT created_at FROM posts WHERE is_deleted = 0 ORDER BY created_at DESC LIMIT 1`).get() as any;
    const latestPostTime = postRow ? postRow.created_at : null;

    return new Response(JSON.stringify({ 
      unreadNotifications,
      unreadMessages,
      latestPostTime
    }), {
      status: 200, headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed' }), { status: 500 });
  }
};
