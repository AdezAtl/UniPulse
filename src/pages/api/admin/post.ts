import type { APIRoute } from 'astro';
import { updatePost, addAdminLog } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.isAdmin) return err('Unauthorized', 403);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { action, postId, content } = body;
  const adminId = locals.user.id;
  if (!postId) return err('postId is required.');

  if (action === 'delete') {
    updatePost(postId, { is_deleted: 1 });
    addAdminLog(adminId, 'delete_post', 'post', postId);
    return ok();
  }
  if (action === 'restore') {
    updatePost(postId, { is_deleted: 0 });
    addAdminLog(adminId, 'restore_post', 'post', postId);
    return ok();
  }
  if (action === 'flag') {
    updatePost(postId, { is_flagged: 1 });
    addAdminLog(adminId, 'flag_post', 'post', postId);
    return ok();
  }
  if (action === 'unflag') {
    updatePost(postId, { is_flagged: 0 });
    addAdminLog(adminId, 'unflag_post', 'post', postId);
    return ok();
  }
  if (action === 'edit') {
    const trimmed = content?.trim() ?? '';
    if (!trimmed || trimmed.length > 280) return err('Content must be 1–280 characters.');
    updatePost(postId, { content: trimmed });
    addAdminLog(adminId, 'edit_post', 'post', postId, { new_content: trimmed });
    return ok();
  }
  return err(`Unknown action: ${action}`);
};

const ok = () => new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
const err = (message: string, status = 400) => new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });