import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In demo mode, middleware just passes through since auth is handled client-side
// In production, this would check Supabase session cookies

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't need auth
  const publicRoutes = ['/', '/login', '/signup'];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // In demo mode, auth is handled client-side via localStorage
  // The DashboardLayout component handles redirects for unauthenticated users
  // In production, you would check the Supabase session cookie here:
  //
  // const supabaseSession = request.cookies.get('sb-access-token');
  // if (!supabaseSession && pathname.startsWith('/dashboard')) {
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
};
