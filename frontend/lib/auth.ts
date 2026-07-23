const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export async function login(email: string, password: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Login failed");
  }
}

export async function register(name: string, email: string, password: string, department?: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, department }),
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Registration failed");
  }
}

export async function logout(): Promise<void> {
  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Logout failed");
  }
}

export async function getMe(): Promise<any> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function isAuthenticated(): Promise<boolean> {
  const res = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    credentials: "include",
  });
  return res.ok;
}
