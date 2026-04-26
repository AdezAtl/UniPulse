import type { APIRoute } from 'astro';
import { createEvent } from '../../lib/db';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { title, description, event_date, location, media_url } = body;
  if (!title?.trim() || !description?.trim() || !event_date?.trim() || !location?.trim()) {
    return err('All fields (title, description, date, location) are required.');
  }

  createEvent(
    title.trim(), 
    description.trim(), 
    event_date.trim(), 
    location.trim(), 
    locals.user.id,
    media_url?.trim() || null
  );

  return new Response(JSON.stringify({ success: true }), {
    status: 201, headers: { 'Content-Type': 'application/json' },
  });
};

function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}
