import type { APIRoute } from 'astro';
import { setUserRole, setUserBanned, addAdminLog, deleteAllUserSessions } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.isAdmin) return err('Unauthorized', 403);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { action, targetUserId, reason } = body;
  const adminId = locals.user.id;
  if (!targetUserId) return err('targetUserId is required.');
  if (targetUserId === adminId && (action === 'demote' || action === 'ban'))
    return err('You cannot perform this action on your own account.');

  if (action === 'promote') {
    setUserRole(targetUserId, 'admin');
    addAdminLog(adminId, 'promote_user', 'user', targetUserId);
    return ok();
  }
  if (action === 'demote') {
    setUserRole(targetUserId, 'user');
    addAdminLog(adminId, 'demote_user', 'user', targetUserId);
    return ok();
  }
  if (action === 'ban') {
    setUserBanned(targetUserId, true);
    deleteAllUserSessions(targetUserId); // force logout immediately
    addAdminLog(adminId, 'ban_user', 'user', targetUserId, { reason: reason ?? '' });
    return ok();
  }
  if (action === 'unban') {
    setUserBanned(targetUserId, false);
    addAdminLog(adminId, 'unban_user', 'user', targetUserId);
    return ok();
  }
  return err(`Unknown action: ${action}`);
};

const ok = () => new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
const err = (message: string, status = 400) => new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });