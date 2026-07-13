import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const publicPaths = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value;

  const isPublicPath = publicPaths.includes(pathname);

  // 1. If hitting root (landing page), always redirect to login (or dashboard if auth'd)
  if (pathname === '/') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // If authenticated, fall through to role-based routing
  }

  // 2. Unauthenticated user trying to access a protected route
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. Authenticated user logic
  if (token && role) {
    // If trying to access login page, redirect to dashboard
    if (isPublicPath || pathname === '/') {
      if (role === 'SUPERVISOR') {
        return NextResponse.redirect(new URL('/supervisor/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

// Ensure the middleware is only called for relevant paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
