import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  // Auth guard
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
  const postId  = body.postId  as string;
  const content = body.content as string | undefined;
  const adminId = locals.user.id;
  const sb      = locals.supabase;

  if (!postId) {
    return new Response(JSON.stringify({ error: 'postId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'delete') {
    const { error } = await sb.from('posts').update({ is_deleted: true }).eq('id', postId);
    if (error) return serverErr(error.message);
    await audit(sb, adminId, 'delete_post', postId, {});
    return ok();
  }

  if (action === 'restore') {
    const { error } = await sb.from('posts').update({ is_deleted: false }).eq('id', postId);
    if (error) return serverErr(error.message);
    await audit(sb, adminId, 'restore_post', postId, {});
    return ok();
  }

  if (action === 'flag') {
    const { error } = await sb.from('posts').update({ is_flagged: true }).eq('id', postId);
    if (error) return serverErr(error.message);
    await audit(sb, adminId, 'flag_post', postId, {});
    return ok();
  }

  if (action === 'unflag') {
    const { error } = await sb.from('posts').update({ is_flagged: false }).eq('id', postId);
    if (error) return serverErr(error.message);
    await audit(sb, adminId, 'unflag_post', postId, {});
    return ok();
  }

  if (action === 'edit') {
    const trimmed = content?.trim() ?? '';
    if (!trimmed || trimmed.length > 280) {
      return new Response(JSON.stringify({ error: 'Content must be 1–280 characters.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { error } = await sb.from('posts').update({ content: trimmed }).eq('id', postId);
    if (error) return serverErr(error.message);
    await audit(sb, adminId, 'edit_post', postId, { new_content: trimmed });
    return ok();
  }

  return new Response(JSON.stringify({ error: `Unknown action: ${action}` }), {
    status: 400,
    headers: { 'Content-Type': 'application/json' },
  });
};

async function audit(
  sb: any,
  adminId: string,
  action: string,
  targetId: string,
  metadata: Record<string, unknown>
) {
  await sb.from('admin_logs').insert({
    admin_id:    adminId,
    action:      action,
    target_type: 'post',
    target_id:   targetId,
    metadata:    metadata,
  });
}

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