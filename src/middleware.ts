import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Supabase JS v2 stores auth sessions in localStorage (browser-only),
  // NOT in cookies. So we cannot check auth state in middleware.
  // Each page handles its own auth guard via the useAuth() hook.
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|api).*)',
  ],
};
