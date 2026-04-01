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

  const action       = body.action       as string;
  const targetUserId = body.targetUserId as string;
  const reason       = body.reason       as string | undefined;
  const adminId      = locals.user.id;
  const sb           = locals.supabase;

  if (!targetUserId) {
    return new Response(JSON.stringify({ error: 'targetUserId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (targetUserId === adminId && (action === 'demote' || action === 'ban')) {
    return new Response(JSON.stringify({ error: 'You cannot perform this action on your own account.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (action === 'promote') {
    const { error } = await sb.rpc('promote_to_admin', {
      target_user_id:  targetUserId,
      acting_admin_id: adminId,
    });
    if (error) return serverErr(error.message);
    return ok();
  }

  if (action === 'demote') {
    const { error } = await sb.rpc('demote_to_user', {
      target_user_id:  targetUserId,
      acting_admin_id: adminId,
    });
    if (error) return serverErr(error.message);
    return ok();
  }

  if (action === 'ban') {
    const { error } = await sb.rpc('ban_user', {
      target_user_id:  targetUserId,
      acting_admin_id: adminId,
      ban_reason:      reason ?? null,
    });
    if (error) return serverErr(error.message);
    return ok();
  }

  if (action === 'unban') {
    const { error } = await sb.rpc('unban_user', {
      target_user_id:  targetUserId,
      acting_admin_id: adminId,
    });
    if (error) return serverErr(error.message);
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