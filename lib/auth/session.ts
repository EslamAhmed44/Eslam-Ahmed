import { cookies } from 'next/headers';

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'EslamAhmed44';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const COOKIE_NAME = 'eslam_admin_session';

export async function verifyAdminCredentials(usernameOrEmail: string, pass: string): Promise<boolean> {
  if (!usernameOrEmail || !pass || !ADMIN_PASSWORD) return false;
  const cleanInput = usernameOrEmail.trim().toLowerCase();
  const targetUsername = ADMIN_USERNAME.trim().toLowerCase();

  return cleanInput === targetUsername && pass === ADMIN_PASSWORD;
}

export async function createAdminSession(username: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = Buffer.from(
    JSON.stringify({
      username,
      timestamp: Date.now(),
      role: 'admin',
    })
  ).toString('base64');

  cookieStore.set(COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return Boolean(decoded && decoded.role === 'admin');
  } catch {
    return false;
  }
}
