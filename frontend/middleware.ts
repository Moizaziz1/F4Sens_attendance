import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function verifyAuth(token: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Cookie: `access_token=${token}` },
      credentials: "include",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  // Skip auth verification during build/prerendering
  if (process.env.NEXT_PHASE === "phase-production-build" || !process.env.NEXT_PUBLIC_API_URL) {
    return NextResponse.next();
  }

  if (isAuthPage && token) {
    const isValid = await verifyAuth(token);
    if (isValid) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isProtectedRoute) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const isValid = await verifyAuth(token);
    if (!isValid) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("access_token");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/login", "/register"],
};