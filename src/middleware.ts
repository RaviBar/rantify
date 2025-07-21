import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
export { default } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  if (
    token &&
    (
      pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/verify" ||
      pathname === "/"
    )
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  if(!token && pathname.startsWith('/dashboard')){
    return NextResponse.redirect(new URL('/sign-in', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/", "/dashboard/:path*", "/verify/:path*"],
};
