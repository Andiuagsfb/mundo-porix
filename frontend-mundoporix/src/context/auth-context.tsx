"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  api,
  ApiError,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/api";
import type { AuthResponse, AuthUser, User } from "@/lib/types";

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "anonymous";
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  loginError: string | null;
  setLoginError: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<
    "loading" | "authenticated" | "anonymous"
  >("loading");
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const restore = async () => {
      if (!getAccessToken() && !getRefreshToken()) {
        if (!cancelled) setStatus("anonymous");
        return;
      }
      try {
        const profile = await api.get<User>("/auth/me");
        if (cancelled) return;
        setUser({
          id: profile.id,
          email: profile.email,
          fullName: profile.fullName,
          roleName: profile.role.name,
        });
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        clearTokens();
        setUser(null);
        setStatus("anonymous");
      }
    };

    restore();

    const onExpired = () => {
      clearTokens();
      setUser(null);
      setStatus("anonymous");
      setLoginOpen(true);
    };
    window.addEventListener("mp:auth-expired", onExpired);

    return () => {
      cancelled = true;
      window.removeEventListener("mp:auth-expired", onExpired);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setLoginError(null);
    try {
      const data = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      setTokens(data.accessToken, data.refreshToken);
      setUser(data.user);
      setStatus("authenticated");
      setLoginOpen(false);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.";
      setLoginError(message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post<void>("/auth/logout", {});
    } catch {
      /* sin conexión: igual cerramos la sesión local */
    }
    clearTokens();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const openLogin = useCallback(() => {
    setLoginError(null);
    setLoginOpen(true);
  }, []);

  const closeLogin = useCallback(() => {
    setLoginOpen(false);
    setLoginError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      loginOpen,
      openLogin,
      closeLogin,
      loginError,
      setLoginError,
    }),
    [user, status, login, logout, loginOpen, openLogin, closeLogin, loginError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
