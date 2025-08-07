import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Redirect authenticated users from auth pages to dashboard
  if (
    token &&
    (pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/verify" ||
      pathname === "/")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users from app pages to sign-in
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // If user is authenticated but not verified, redirect to verify page
  // unless they are already on verify page or auth options
  if (
    token &&
    !token.isVerified && // Check the isVerified flag from the token
    !pathname.startsWith("/verify") && // Don't redirect if already on verify page
    !pathname.startsWith("/api/auth") // Don't redirect if calling auth API routes
  ) {
    // You might want to allow access to specific public pages even if not verified
    // e.g., if (pathname.startsWith('/public-posts')) return NextResponse.next();
    return NextResponse.redirect(new URL(`/verify/${token.username}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
};