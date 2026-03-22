import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.isAdmin || !locals.user) return json({ error: 'Unauthorized' }, 403);

  const { action, type, itemId, updates } = await request.json().catch(() => ({}));
  const adminId = locals.user.id;

  if (!itemId || !type) return json({ error: 'itemId and type are required.' }, 400);
  if (!['resource', 'news'].includes(type)) return json({ error: 'Invalid type.' }, 400);

  const table = type === 'resource' ? 'resources' : 'news';
  let dbError: any = null;

  switch (action) {
    case 'delete':
      ({ error: dbError } = await locals.supabase.from(table).update({ is_deleted: true }).eq('id', itemId));
      if (!dbError) await log(locals.supabase, adminId, `delete_${type}`, type, itemId);
      break;
    case 'restore':
      ({ error: dbError } = await locals.supabase.from(table).update({ is_deleted: false }).eq('id', itemId));
      if (!dbError) await log(locals.supabase, adminId, `restore_${type}`, type, itemId);
      break;
    case 'edit': {
      if (!updates) return json({ error: 'No updates provided.' }, 400);
      const allowed = type === 'resource' ? ['title', 'description'] : ['title', 'content'];
      const safe = Object.fromEntries(
        Object.entries(updates as Record<string, unknown>)
          .filter(([k]) => allowed.includes(k))
          .map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])
      );
      if (!Object.keys(safe).length) return json({ error: 'No valid fields to update.' }, 400);
      ({ error: dbError } = await locals.supabase.from(table).update(safe).eq('id', itemId));
      if (!dbError) await log(locals.supabase, adminId, `edit_${type}`, type, itemId, { updates: safe });
      break;
    }
    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }

  if (dbError) return json({ error: dbError.message }, 500);
  return json({ success: true });
};

async function log(sb: any, adminId: string, action: string, targetType: string, targetId: string, metadata: Record<string, unknown> = {}) {
  await sb.from('admin_logs').insert({ admin_id: adminId, action, target_type: targetType, target_id: targetId, metadata });
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
