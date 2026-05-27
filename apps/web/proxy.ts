import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_ROUTES = ["/dashboard", "/settings", "/analytics"];
const AUTH_ROUTES = ["/login", "/signup", "/forget-password"];

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const path = request.nextUrl.pathname;

  const isProtected = PROTECTED_ROUTES.some((route) => path.startsWith(route));
  const isAuthPage = AUTH_ROUTES.some((route) => path.startsWith(route));

  // Redirect unauthorized visitors to login
  if (isProtected && !sessionCookie) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(redirectUrl);
  }

  // Redirect logged-in users away from auth pages
  if (isAuthPage && sessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/analytics/:path*",
    "/login",
    "/signup",
    "/forget-password",
  ],
};
