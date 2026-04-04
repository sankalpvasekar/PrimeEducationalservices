import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Protect admin
  if (pathname.startsWith('/admin')) {
    // In middleware (Edge Runtime), we only check for cookie presence
    // Full payload verification happens in Server Components/APIs
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // We remove the automatic redirect from login/register if a token exists.
  // This allows the user to always access the login form if they are stuck or want to switch accounts.
  // The login page itself can handle the redirection if the user is truly logged in.

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/register'],
};
