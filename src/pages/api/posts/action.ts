import type { APIRoute } from 'astro';
import { updatePost, addAdminLog, getPostById } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { action, postId, content } = body;
  const userId = locals.user.id;
  const isAdmin = locals.isAdmin;

  if (!postId) return err('postId is required.');

  const post = getPostById(postId);
  if (!post) return err('Post not found.', 404);

  const isAuthor = post.author_id === userId;
  if (!isAdmin && !isAuthor) return err('Unauthorized', 403);

  // Non-admins can only edit and delete their own posts
  if (!isAdmin && !['edit', 'delete'].includes(action)) {
    return err('Unauthorized action.', 403);
  }

  if (action === 'delete') {
    updatePost(postId, { is_deleted: 1 });
    if (isAdmin && !isAuthor) addAdminLog(userId, 'delete_post', 'post', postId);
    return ok();
  }
  if (action === 'restore') {
    updatePost(postId, { is_deleted: 0 });
    if (isAdmin) addAdminLog(userId, 'restore_post', 'post', postId);
    return ok();
  }
  if (action === 'flag') {
    updatePost(postId, { is_flagged: 1 });
    if (isAdmin) addAdminLog(userId, 'flag_post', 'post', postId);
    return ok();
  }
  if (action === 'unflag') {
    updatePost(postId, { is_flagged: 0 });
    if (isAdmin) addAdminLog(userId, 'unflag_post', 'post', postId);
    return ok();
  }
  if (action === 'edit') {
    const trimmed = content?.trim() ?? '';
    if (!trimmed) return err('Content cannot be empty.');
    // Removed 280 char limit to support rich text and longer posts if we want, or keep it. Let's make it 2000.
    if (trimmed.length > 2000) return err('Content must be under 2000 characters.');
    
    updatePost(postId, { content: trimmed });
    if (isAdmin && !isAuthor) addAdminLog(userId, 'edit_post', 'post', postId, { new_content: trimmed });
    return ok();
  }
  return err(`Unknown action: ${action}`);
};

const ok = () => new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
const err = (message: string, status = 400) => new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });
