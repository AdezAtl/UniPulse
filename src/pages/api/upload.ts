import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: 'No file uploaded.' }), { status: 400 });
    }

    // Validate size (e.g. max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: 'File too large (max 100MB).' }), { status: 400 });
    }

    // Basic validation of types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const validDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/zip', 'text/plain'];
    
    if (!validImageTypes.includes(file.type) && !validDocTypes.includes(file.type) && !file.type.startsWith('video/')) {
      return new Response(JSON.stringify({ error: 'Unsupported file type.' }), { status: 400 });
    }

    // Determine extension
    const ext = file.name.split('.').pop();
    const fileName = `${randomUUID()}.${ext}`;

    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    const buffer = await file.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));

    const url = `/uploads/${fileName}`;

    return new Response(JSON.stringify({ success: true, url }), {
      status: 200, headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response(JSON.stringify({ error: 'Failed to upload file.' }), { status: 500 });
  }
};
