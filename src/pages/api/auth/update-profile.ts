import type { APIRoute } from 'astro';
import {
  updateUser, updateUserPassword, getPasswordHash,
  getUserByUsername,
} from '../../../lib/db';
import { verifyPassword, hashPassword } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user) return err('Unauthorized', 401);
  let body: any = {};
  try { body = await request.json(); } catch { }

  const { action } = body;
  const userId = locals.user.id;

  if (action === 'update_profile') {
    const { username, full_name, department, level } = body;
    if (!username?.trim()) return err('Username is required.');
    if (username.trim().length < 3) return err('Username must be at least 3 characters.');
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return err('Letters, numbers, underscores only.');
    if (!department?.trim()) return err('Department is required.');
    if (!level?.trim()) return err('Level is required.');

    const existing = getUserByUsername(username.trim());
    if (existing && existing.id !== userId) return err('That username is already taken.');

    updateUser(userId, {
      username: username.trim(),
      full_name: full_name?.trim() || null,
      department: department.trim(),
      level: level.trim(),
    });
    return ok({ message: 'Profile updated.' });
  }

  if (action === 'change_password') {
    const { current_password, new_password } = body;
    if (!new_password || new_password.length < 8) return err('New password must be at least 8 characters.');

    const hash = getPasswordHash(userId);
    if (!hash) return err('User not found.', 404);

    const valid = await verifyPassword(current_password, hash);
    if (!valid) return err('Current password is incorrect.');

    const newHash = await hashPassword(new_password);
    updateUserPassword(userId, newHash);
    return ok({ message: 'Password updated.' });
  }

  return err('Unknown action.', 400);
};

function ok(data: object) {
  return new Response(JSON.stringify(data), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  });
}
function err(message: string, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status, headers: { 'Content-Type': 'application/json' },
  });
}