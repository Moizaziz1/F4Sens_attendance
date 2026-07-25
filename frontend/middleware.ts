import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

async function verifyAuth(token: string, request: NextRequest): Promise<boolean> {
  try {
    const meUrl = new URL("/api/auth/me", request.url);
    const res = await fetch(meUrl.toString(), {
      headers: { Cookie: `access_token=${token}` },
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

  if (process.env.NEXT_PHASE === "phase-production-build") {
    return NextResponse.next();
  }

  if (isAuthPage && token) {
    const isValid = await verifyAuth(token, request);
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

    const isValid = await verifyAuth(token, request);
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
