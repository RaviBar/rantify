// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// IMPORTANT: remove `export { default } from "next-auth/middleware";`
// because we're providing a custom middleware now.

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  const isLoggedIn = !!token;
  const isAuthPage =
    pathname === '/sign-in' ||
    pathname === '/sign-up' ||
    pathname.startsWith('/verify');

  // Define protected areas (add more prefixes if needed)
  const isProtected =
    pathname.startsWith('/dashboard');

  // 1) If logged in & visiting an auth page → go home
  if (isLoggedIn && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = ''; // clear query
    return NextResponse.redirect(url);
  }

  // 2) If NOT logged in & visiting protected → go to sign-in
  if (!isLoggedIn && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    url.searchParams.set('callbackUrl', pathname); // optional
    return NextResponse.redirect(url);
  }

  // 3) If logged in but NOT verified → only block protected pages
  if (
    isLoggedIn &&
    (token as any)?.isVerified === false &&
    isProtected &&
    !pathname.startsWith('/verify')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/verify/${(token as any)?.username ?? ''}`;
    return NextResponse.redirect(url);
  }

  // 4) Home ("/") & other public pages stay accessible for everyone
  return NextResponse.next();
}

export const config = {
  // Do NOT include "/" in matcher. Keep it public.
  matcher: [
    '/sign-in',
    '/sign-up',
    '/verify/:path*',
    '/dashboard/:path*',
  ],
};
