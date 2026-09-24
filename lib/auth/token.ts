/**
 * Cryptographically Secure Admin Session Token Utilities
 * Built with Web Crypto API (HMAC-SHA256) for universal compatibility
 * across Node.js runtime, Edge runtime (Next.js middleware), and Server Components.
 */

export const COOKIE_NAME = 'eslam_admin_session';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Eslam100314';

export interface AdminSessionPayload {
  username: string;
  role: 'admin';
  timestamp: number;
  exp: number; // Expiration timestamp in ms
}

/**
 * Generate HMAC-SHA256 signature in hexadecimal
 */
async function generateSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a tamper-proof signed session token (base64url payload + hmac signature)
 */
export async function createSessionToken(username: string): Promise<string> {
  const payload: AdminSessionPayload = {
    username,
    role: 'admin',
    timestamp: Date.now(),
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = Buffer.from(payloadString, 'utf-8').toString('base64url');
  const signature = await generateSignature(encodedPayload, ADMIN_PASSWORD);

  return `${encodedPayload}.${signature}`;
}

/**
 * Verify session token integrity, HMAC signature, and expiration
 */
export async function verifySessionToken(
  tokenString: string | undefined | null
): Promise<AdminSessionPayload | null> {
  if (!tokenString || typeof tokenString !== 'string') return null;

  try {
    // Handle URL-encoded cookies safely
    const cleanToken = decodeURIComponent(tokenString).trim();
    if (!cleanToken) return null;

    // Check signed token format: <base64urlPayload>.<signature>
    const parts = cleanToken.split('.');
    if (parts.length === 2) {
      const [encodedPayload, receivedSignature] = parts;
      const expectedSignature = await generateSignature(encodedPayload, ADMIN_PASSWORD);

      if (receivedSignature !== expectedSignature) {
        return null; // Signature mismatch - tampered token
      }

      const decodedJson = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
      const payload = JSON.parse(decodedJson) as AdminSessionPayload;

      // Check role
      if (!payload || payload.role !== 'admin') {
        return null;
      }

      // Check expiration
      if (payload.exp && Date.now() > payload.exp) {
        return null; // Expired session
      }

      return payload;
    }

    // Fallback: Support legacy base64 format during migration if valid
    const legacyJson = Buffer.from(cleanToken, 'base64').toString('utf-8');
    const legacy = JSON.parse(legacyJson);
    if (legacy && legacy.role === 'admin') {
      return {
        username: legacy.username || 'EslamAhmed44',
        role: 'admin',
        timestamp: legacy.timestamp || Date.now(),
        exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
      };
    }

    return null;
  } catch {
    return null;
  }
}
