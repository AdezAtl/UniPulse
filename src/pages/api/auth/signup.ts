import type { APIRoute } from 'astro';
import { createUser, getUserByEmail, getUserByUsername, newId } from '../../../lib/db';
import { hashPassword, generatePulseId, COOKIE_NAME, COOKIE_MAX_AGE } from '../../../lib/auth';
import { createSession } from '../../../lib/db';

export const POST: APIRoute = async ({ request, cookies }) => {
    let body: any = {};
    try { body = await request.json(); } catch { }

    const { email, password, username, full_name, department, level } = body;

    if (!email?.trim()) return err('Email is required.');
    if (!password) return err('Password is required.');
    if (password.length < 8) return err('Password must be at least 8 characters.');
    if (!username?.trim()) return err('Username is required.');
    if (username.trim().length < 3) return err('Username must be at least 3 characters.');
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) return err('Username: letters, numbers, underscores only.');
    if (!department?.trim()) return err('Department is required.');
    if (!level?.trim()) return err('Level is required.');

    if (getUserByEmail(email.trim())) return err('Email is already registered.');
    if (getUserByUsername(username.trim())) return err('Username is already taken.');

    const password_hash = await hashPassword(password);
    const user = createUser({
        id: newId(), email: email.trim().toLowerCase(),
        username: username.trim(), pulse_id: generatePulseId(),
        password_hash, full_name: full_name?.trim() || null,
        department: department.trim(), level: level.trim(),
    });

    const token = createSession(user.id);
    cookies.set(COOKIE_NAME, token, {
        httpOnly: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE,
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 201, headers: { 'Content-Type': 'application/json' },
    });
};

function err(message: string) {
    return new Response(JSON.stringify({ error: message }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
    });
}