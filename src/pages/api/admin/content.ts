import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || !locals.isAdmin) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: Record<string, any> = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const action  = body.action  as string;
  const type    = body.type    as string;
  const itemId  = body.itemId  as string;
  const updates = body.updates as Record<string, string> | undefined;
  const adminId = locals.user.id;
  const sb      = locals.supabase;

  if (!itemId || !type) {
    return new Response(JSON.stringify({ error: 'itemId and type are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (type !== 'resource' && type !== 'news') {
    return new Response(JSON.stringify({ error: 'type must be resource or news' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const table = type === 'resource' ? 'resources' : 'news';

  if (action === 'delete') {
    const { error } = await sb.from(table).update({ is_deleted: true }).eq('id', itemId);
    if (error) return serverErr(error.message);
    await sb.from('admin_logs').insert({
      admin_id: adminId, action: `delete_${type}`,
      target_type: type, target_id: itemId, metadata: {},
    });
    return ok();
  }

  if (action === 'restore') {
    const { error } = await sb.from(table).update({ is_deleted: false }).eq('id', itemId);
    if (error) return serverErr(error.message);
    await sb.from('admin_logs').insert({
      admin_id: adminId, action: `restore_${type}`,
      target_type: type, target_id: itemId, metadata: {},
    });
    return ok();
  }

  if (action === 'edit') {
    if (!updates) {
      return new Response(JSON.stringify({ error: 'updates object is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const allowed = type === 'resource' ? ['title', 'description'] : ['title', 'content'];
    const safe: Record<string, string> = {};
    for (const key of allowed) {
      if (updates[key] !== undefined) safe[key] = String(updates[key]).trim();
    }
    if (Object.keys(safe).length === 0) {
      return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { error } = await sb.from(table).update(safe).eq('id', itemId);
    if (error) return serverErr(error.message);
    await sb.from('admin_logs').insert({
      admin_id: adminId, action: `edit_${type}`,
      target_type: type, target_id: itemId, metadata: { updates: safe },
    });
    return ok();
  }

  return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};

function ok() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function serverErr(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 500,
    headers: { 'Content-Type': 'application/json' },
  });
}