const POST = async ({ request, locals }) => {
  if (!locals.isAdmin || !locals.user) return json({ error: "Unauthorized" }, 403);
  const { action, targetUserId, reason } = await request.json().catch(() => ({}));
  const adminId = locals.user.id;
  if (!targetUserId) return json({ error: "targetUserId is required." }, 400);
  if (targetUserId === adminId && ["demote", "ban"].includes(action)) {
    return json({ error: "You cannot perform this action on your own account." }, 400);
  }
  let dbError = null;
  switch (action) {
    case "promote":
      ({ error: dbError } = await locals.supabase.rpc("promote_to_admin", { target_user_id: targetUserId, acting_admin_id: adminId }));
      break;
    case "demote":
      ({ error: dbError } = await locals.supabase.rpc("demote_to_user", { target_user_id: targetUserId, acting_admin_id: adminId }));
      break;
    case "ban":
      ({ error: dbError } = await locals.supabase.rpc("ban_user", { target_user_id: targetUserId, acting_admin_id: adminId, ban_reason: reason ?? null }));
      break;
    case "unban":
      ({ error: dbError } = await locals.supabase.rpc("unban_user", { target_user_id: targetUserId, acting_admin_id: adminId }));
      break;
    default:
      return json({ error: `Unknown action: ${action}` }, 400);
  }
  if (dbError) return json({ error: dbError.message }, 500);
  return json({ success: true });
};
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
