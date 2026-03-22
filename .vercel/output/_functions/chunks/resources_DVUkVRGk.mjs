const POST = async ({ request, locals }) => {
  const user = locals.user;
  if (!user) return json({ error: "Unauthorized" }, 401);
  const body = await request.json().catch(() => ({}));
  const { title, description, link_url, file_url } = body;
  if (!title?.trim()) return json({ error: "Title is required." }, 400);
  if (!link_url && !file_url)
    return json({ error: "Provide at least a link URL or file URL." }, 400);
  const { error } = await locals.supabase.from("resources").insert({
    title: title.trim(),
    description: description?.trim() || null,
    link_url: link_url?.trim() || null,
    file_url: file_url?.trim() || null,
    uploaded_by: user.id
  });
  if (error) return json({ error: error.message }, 500);
  return json({ success: true }, 201);
};
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json" }
});

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
