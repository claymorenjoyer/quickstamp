import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const session = await auth();
  const { pathname } = req.nextUrl;

  const publicPaths = ["/login", "/register", "/forgot-password"];
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!session) {
    if (isPublic) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname === "/" || pathname === "/login" || pathname === "/register") {
    const home =
      session.user.role === "admin"
        ? "/admin"
        : session.user.role === "staff"
          ? "/staff"
          : "/dashboard";
    return NextResponse.redirect(new URL(home, req.url));
  }

  if (pathname.startsWith("/admin") && session.user.role !== "admin") {
    const fallback =
      session.user.role === "staff" ? "/staff" : "/dashboard";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  if (pathname.startsWith("/staff") && session.user.role !== "staff") {
    const fallback =
      session.user.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  // Staff with pending/rejected shop can only see the status page
  if (
    pathname.startsWith("/staff") &&
    session.user.role === "staff" &&
    session.user.shopStatus &&
    session.user.shopStatus !== "active" &&
    pathname !== "/staff/pending"
  ) {
    return NextResponse.redirect(new URL("/staff/pending", req.url));
  }

  if (pathname.startsWith("/dashboard") && session.user.role !== "customer") {
    const fallback =
      session.user.role === "admin"
        ? "/admin"
        : "/staff";
    return NextResponse.redirect(new URL(fallback, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico|manifest\\.json).*)"],
};
