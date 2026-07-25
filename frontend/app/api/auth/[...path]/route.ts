import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const COOKIE_NAME = "access_token";
const COOKIE_MAX_AGE = 60 * 60 * 24;

async function proxyRequest(request: NextRequest, path: string) {
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

  const backendRes = await fetch(url, init);
  const data = await backendRes.json();

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
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  return proxyRequest(request, path.join("/"));
}
