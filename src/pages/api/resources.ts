import type { APIRoute } from 'astro';
import { createResource } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { title, description, link_url, file_url } = body;
  if (!title?.trim()) return err('Title is required.');
  if (!link_url && !file_url) return err('Provide at least a link URL or file URL.');

  createResource({
    title: title.trim(),
    description: description?.trim() || null,
    link_url: link_url?.trim() || null,
    file_url: file_url?.trim() || null,
    uploaded_by: locals.user.id,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}