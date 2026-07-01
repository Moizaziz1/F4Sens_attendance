"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { removeAuthToken } from "./cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string | null;
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    // Skip during build/SSR
    if (typeof window === "undefined" || process.env.NEXT_PHASE === "phase-production-build") {
      setIsLoading(false);
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/auth/me`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: "POST", credentials: "include" });
    } catch {
      // ignore
    } finally {
      removeAuthToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  return (
    <AuthContext.Provider value={{ user, isLoading, refreshUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
