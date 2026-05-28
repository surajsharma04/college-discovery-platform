"use client";

import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { apiRequest } from "@/lib/api-client";
import type { AuthUser } from "@/types/api";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  async function refreshUser() {
    try {
      const { payload } = await apiRequest<{ user: AuthUser | null }>("/auth/me");
      startTransition(() => {
        setUser(payload.user ?? null);
        setLoading(false);
      });
    } catch {
      startTransition(() => {
        setUser(null);
        setLoading(false);
      });
    }
  }

  useEffect(() => {
    void refreshUser();
  }, []);

  async function login(email: string, password: string) {
    const { ok, payload } = await apiRequest<{
      message?: string;
      user?: AuthUser;
    }>("/auth/login", {
      method: "POST",
      body: { email, password }
    });

    if (!ok) {
      return {
        ok: false,
        message: payload.message ?? "Login failed."
      };
    }

    await refreshUser();
    return { ok: true };
  }

  async function register(name: string, email: string, password: string) {
    const { ok, payload } = await apiRequest<{
      message?: string;
      user?: AuthUser;
    }>("/auth/register", {
      method: "POST",
      body: { name, email, password }
    });

    if (!ok) {
      return {
        ok: false,
        message: payload.message ?? "Registration failed."
      };
    }

    await refreshUser();
    return { ok: true };
  }

  async function logout() {
    await apiRequest("/auth/logout", {
      method: "POST"
    });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }
  return context;
}
