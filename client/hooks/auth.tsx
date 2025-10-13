import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role = "GUEST" | "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: number;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithEmail(email: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "ph_user";
const FIRST_ADMIN_KEY = "ph_first_admin";

function generateId(email: string) {
  // Simple deterministic id for demo purposes
  return btoa(email).replace(/=/g, "");
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const token = localStorage.getItem('ph_token');
    async function init() {
      if (token) {
        try {
          const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
            setUser(data.user);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn('auth me failed', err);
        }
      }
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as User;
          setUser(parsed);
        } catch (_) {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  const loginWithEmail = useCallback(async (email: string) => {
    const normalized = email.trim().toLowerCase();
    // request magic link
    try {
      const res = await fetch('/api/auth/request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: normalized }) });
      const data = await res.json();
      // If server returned token (email not sent), verify immediately
      if (data.token) {
        const verify = await fetch(`/api/auth/verify?token=${encodeURIComponent(data.token)}`);
        const payload = await verify.json();
        if (payload.token && payload.user) {
          localStorage.setItem('ph_token', payload.token);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.user));
          setUser(payload.user);
        }
        return;
      }
      // Otherwise, inform user to check email (fallback: not implemented UI-wise)
      // For demo, we attempt to poll /api/auth/me after a short delay if token not present
    } catch (err) {
      console.error(err);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('ph_token');
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, loginWithEmail, logout }), [user, loading, loginWithEmail, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
