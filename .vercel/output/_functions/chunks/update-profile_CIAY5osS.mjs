const POST = async ({ request, locals }) => {
  if (!locals.user) return err("Unauthorized", 401);
  let body = {};
  try {
    body = await request.json();
  } catch {
  }
  const { action } = body;
  const sb = locals.supabase;
  const userId = locals.user.id;
  if (action === "update_profile") {
    const { username, full_name, department, level } = body;
    if (!username?.trim()) return err("Username is required.");
    if (username.trim().length < 3) return err("Username must be at least 3 characters.");
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return err("Username can only contain letters, numbers and underscores.");
    if (!department?.trim()) return err("Department is required.");
    if (!level?.trim()) return err("Level is required.");
    const { data: existing } = await sb.from("users").select("id").eq("username", username.trim()).neq("id", userId).maybeSingle();
    if (existing) return err("That username is already taken.");
    const { error } = await sb.from("users").update({
      username: username.trim(),
      full_name: full_name?.trim() || null,
      department: department.trim(),
      level: level.trim()
    }).eq("id", userId);
    if (error) return err(error.message, 500);
    return ok({ message: "Profile updated." });
  }
  if (action === "change_password") {
    const { current_password, new_password } = body;
    if (!new_password || new_password.length < 8) return err("New password must be at least 8 characters.");
    const { data: userData } = await sb.from("users").select("email").eq("id", userId).single();
    if (!userData) return err("User not found.", 404);
    const { error: signInError } = await sb.auth.signInWithPassword({
      email: userData.email,
      password: current_password
    });
    if (signInError) return err("Current password is incorrect.");
    const { error } = await sb.auth.updateUser({ password: new_password });
    if (error) return err(error.message, 500);
    return ok({ message: "Password updated." });
  }
  return err("Unknown action.", 400);
};
function ok(data) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
}
function err(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
