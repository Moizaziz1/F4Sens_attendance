import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;
const COOKIE_NAME = "access_token";

async function proxyRequest(request: NextRequest, path: string) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { detail: "NEXT_PUBLIC_API_URL is not set on the server" },
      { status: 500 }
    );
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }

  const url = `${BACKEND_URL}/${path}`;
  const method = request.method;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

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

  return NextResponse.json(data, { status: backendRes.status });
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

export async function PUT(
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

export async function DELETE(
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
