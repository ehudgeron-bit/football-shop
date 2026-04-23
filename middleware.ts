import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const ADMIN_ROUTES = /^\/admin(\/.*)?$/;
const PROTECTED_ROUTES = /^\/(checkout|orders)(\/.*)?$/;
const AUTH_ROUTES = /^\/(login|register)$/;

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session?.user;
  const isAdmin = session?.user?.role === "ADMIN";

  // Admin routes — require ADMIN role
  if (ADMIN_ROUTES.test(nextUrl.pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login?callbackUrl=/admin", nextUrl));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Protected user routes — require login
  if (PROTECTED_ROUTES.test(nextUrl.pathname)) {
    if (!isLoggedIn) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
      );
    }
    return NextResponse.next();
  }

  // Auth pages — redirect logged-in users away
  if (AUTH_ROUTES.test(nextUrl.pathname) && isLoggedIn) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
