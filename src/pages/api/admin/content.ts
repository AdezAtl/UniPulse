import type { APIRoute } from 'astro';
import { updateResource, updateNews, addAdminLog } from '../../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.isAdmin) return err('Unauthorized', 403);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { action, type, itemId, updates } = body;
  const adminId = locals.user.id;
  if (!itemId || !type) return err('itemId and type are required.');
  if (type !== 'resource' && type !== 'news') return err('type must be resource or news.');

  const updateFn = type === 'resource' ? updateResource : updateNews;

  if (action === 'delete') {
    updateFn(itemId, { is_deleted: 1 });
    addAdminLog(adminId, `delete_${type}`, type, itemId);
    return ok();
  }
  if (action === 'restore') {
    updateFn(itemId, { is_deleted: 0 });
    addAdminLog(adminId, `restore_${type}`, type, itemId);
    return ok();
  }
  if (action === 'edit') {
    if (!updates) return err('updates object is required.');
    const allowed = type === 'resource' ? ['title', 'description'] : ['title', 'content'];
    const safe: any = {};
    for (const k of allowed) { if (updates[k] !== undefined) safe[k] = String(updates[k]).trim(); }
    if (!Object.keys(safe).length) return err('No valid fields to update.');
    updateFn(itemId, safe);
    addAdminLog(adminId, `edit_${type}`, type, itemId, { updates: safe });
    return ok();
  }
  return err(`Unknown action: ${action}`);
};

const ok = () => new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
const err = (message: string, status = 400) => new Response(JSON.stringify({ error: message }), { status, headers: { 'Content-Type': 'application/json' } });