import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, verifySessionToken } from './lib/auth/token';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Login page handling
  if (pathname === '/admin/login') {
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionCookie);

    // If already authenticated as admin, redirect to target or overview
    if (session && session.role === 'admin') {
      const redirectTo = req.nextUrl.searchParams.get('redirect') || '/admin';
      return NextResponse.redirect(new URL(redirectTo, req.url));
    }

    return NextResponse.next();
  }

  // 2. Protect ALL Admin routes (/admin, /admin/messages, /admin/projects, etc.)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    const sessionCookie = req.cookies.get(COOKIE_NAME)?.value;
    const session = await verifySessionToken(sessionCookie);

    // If missing or invalid session, strictly redirect to Admin Login
    if (!session || session.role !== 'admin') {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
