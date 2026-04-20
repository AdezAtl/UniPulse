// src/lib/auth.ts
import bcrypt from 'bcryptjs';

export const COOKIE_NAME = 'up_session';
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 3; // 3 days in seconds (sliding)

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generatePulseId(): string {
    return 'UP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}