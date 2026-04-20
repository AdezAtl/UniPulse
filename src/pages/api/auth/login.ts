import type { APIRoute } from 'astro';
import { getUserByEmail, getUserByUsername, getUserByPulseId, createSession } from '../../../lib/db';
import { verifyPassword, COOKIE_NAME, COOKIE_MAX_AGE } from '../../../lib/auth';

export const POST: APIRoute = async ({ request, cookies }) => {
    let body: any = {};
    try { body = await request.json(); } catch { }

    const { identifier, password } = body;
    if (!identifier?.trim()) return err('Please enter your username, email, or Pulse ID.');
    if (!password) return err('Password is required.');

    const id = identifier.trim();

    // Auto-detect identifier type
    let userRow: any = null;
    if (id.toUpperCase().startsWith('UP-')) {
        userRow = getUserByPulseId(id.toUpperCase());
    } else if (id.includes('@')) {
        userRow = getUserByEmail(id.toLowerCase());
    } else {
        userRow = getUserByUsername(id);
    }

    if (!userRow) return err('User not found. Check your username, email, or Pulse ID.');
    if (userRow.is_banned) return err('Your account has been suspended.');

    const valid = await verifyPassword(password, userRow.password_hash);
    if (!valid) return err('Incorrect password.');

    const token = createSession(userRow.id);
    cookies.set(COOKIE_NAME, token, {
        httpOnly: true, sameSite: 'lax', path: '/', maxAge: COOKIE_MAX_AGE,
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { 'Content-Type': 'application/json' },
    });
};

function err(message: string) {
    return new Response(JSON.stringify({ error: message }), {
        status: 400, headers: { 'Content-Type': 'application/json' },
    });
}