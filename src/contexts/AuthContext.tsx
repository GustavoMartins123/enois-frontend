import { type ReactNode, createContext, useContext, useState } from "react";

import type { AuthUser } from "../lib/api/auth";
import { authApi } from "../lib/api/auth";
import { profileApi } from "../lib/api/profile";

export type AppUser = AuthUser & { avatar: string | null };

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AppUser>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(() => {
    try {
      const stored = localStorage.getItem("current_user");
      if (!stored) return null;
      const u = JSON.parse(stored) as AppUser;
      if (u.avatar && u.email && !localStorage.getItem(`avatar_${u.email}`)) {
        try {
          localStorage.setItem(`avatar_${u.email}`, u.avatar);
        } catch {
          /**/
        }
      }
      return u;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!localStorage.getItem("session_token") && !!user;

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem("session_token", res.token);
    localStorage.setItem("refresh_token", res.refreshToken);
    const u: AppUser = { ...res.user, avatar: null };
    try {
      const profile = await profileApi.me();
      if (profile.avatar) u.avatar = profile.avatar;
    } catch {}
    localStorage.setItem("current_user", JSON.stringify(u));
    setUser(u);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await authApi.signup({ name, email, password });
    localStorage.setItem("session_token", res.token);
    localStorage.setItem("refresh_token", res.refreshToken);
    const u: AppUser = { ...res.user, avatar: null };
    try {
      const profile = await profileApi.me();
      if (profile.avatar) u.avatar = profile.avatar;
    } catch {}
    localStorage.setItem("current_user", JSON.stringify(u));
    setUser(u);
  };

  const updateUser = (partial: Partial<AppUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem("current_user", JSON.stringify(updated));
      if ("avatar" in partial) {
        if (partial.avatar) localStorage.setItem(`avatar_${prev.email}`, partial.avatar);
        else localStorage.removeItem(`avatar_${prev.email}`);
      }
      return updated;
    });
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {}
    localStorage.removeItem("session_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
