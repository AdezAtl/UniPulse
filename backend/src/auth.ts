import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generatePulseId(): string {
    return 'UP-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}
