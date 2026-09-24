import { cookies } from 'next/headers';
import {
  COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
  AdminSessionPayload,
} from './token';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'EslamAhmed44';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Eslam100314';

export { COOKIE_NAME };

/**
 * Verify admin credentials against environment or secure defaults.
 * Supports primary username "EslamAhmed44" as well as admin email identifier.
 */
export async function verifyAdminCredentials(
  usernameOrEmail: string,
  pass: string
): Promise<boolean> {
  if (!usernameOrEmail || !pass || !ADMIN_PASSWORD) return false;
  const cleanInput = usernameOrEmail.trim().toLowerCase();
  const targetUsername = ADMIN_USERNAME.trim().toLowerCase();
  const targetEmail = 'smsma4140@gmail.com';

  const matchesIdentifier =
    cleanInput === targetUsername || cleanInput === targetEmail;

  return matchesIdentifier && pass === ADMIN_PASSWORD;
}

/**
 * Create an authenticated HTTP-Only admin session cookie with HMAC signature
 */
export async function createAdminSession(username: string): Promise<void> {
  const cookieStore = await cookies();
  const token = await createSessionToken(username);

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

/**
 * Invalidate and delete admin session cookie
 */
export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, '', {
    path: '/',
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Server-side check for active, valid admin session
 */
export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const session = await verifySessionToken(token);
    return Boolean(session && session.role === 'admin');
  } catch {
    return false;
  }
}

/**
 * Retrieve current admin session payload if authenticated
 */
export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
