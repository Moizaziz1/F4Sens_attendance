import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
const COOKIE_NAME = "access_token";
const COOKIE_MAX_AGE = 60 * 60 * 24;

async function proxyRequest(request: NextRequest, path: string) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL is not set on the server" },
      { status: 500 }
    );
  }

  const url = `${BACKEND_URL}/auth/${path}`;
  const method = request.method;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const init: RequestInit = { method, headers };

  if (method !== "GET" && method !== "HEAD") {
    init.body = await request.text();
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(url, init);
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Cannot reach backend: ${err.message}` },
      { status: 502 }
    );
  }

  const text = await backendRes.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { detail: `Backend returned non-JSON: ${text.slice(0, 300)}` },
      { status: backendRes.status || 502 }
    );
  }

  const response = NextResponse.json(data, { status: backendRes.status });

  if (path === "login" || path === "register") {
    if (backendRes.ok && data.access_token) {
      response.cookies.set(COOKIE_NAME, data.access_token, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: COOKIE_MAX_AGE,
      });
    }
  }

  if (path === "logout") {
    response.cookies.delete(COOKIE_NAME);
  }

  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    return await proxyRequest(request, path.join("/"));
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Proxy error: ${err.message}` },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params;
    return await proxyRequest(request, path.join("/"));
  } catch (err: any) {
    return NextResponse.json(
      { detail: `Proxy error: ${err.message}` },
      { status: 500 }
    );
  }
}
