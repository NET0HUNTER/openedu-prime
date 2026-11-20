import crypto from 'node:crypto';

/**
 * Hashes a plaintext password using Node's built-in scrypt KDF with a 16-byte random salt.
 * Output format: `scrypt$<hex_salt>$<hex_derived_key>`
 */
export function hashPassword(plain: string): string {
  if (!plain || plain.length < 6) {
    throw new Error('Password must be at least 6 characters long.');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

export function verifyPassword(plain: string, storedHash: string): boolean {
  if (!plain || !storedHash || !storedHash.startsWith('scrypt$')) return false;
  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(plain, salt, 64);
    const expected = Buffer.from(expectedHex, 'hex');
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function generateResetToken(): { token: string; expiresAt: string } {
  const token = crypto.randomBytes(24).toString('base64url');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return { token, expiresAt };
}

export function sanitizeUserRecord<T extends Record<string, any>>(rec: T): T {
  const copy = { ...rec } as Record<string, any>;
  copy.password_set = Boolean(rec.password_hash);
  delete copy.password_hash;
  delete copy.initial_password;
  delete copy.reset_token;
  delete copy.reset_token_expires;
  return copy as T;
}
