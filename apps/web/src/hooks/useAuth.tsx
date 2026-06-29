import { useCallback, useContext, useEffect, useRef, useState, createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { queryClient } from "../lib/query-client";
import { supabase } from "../lib/supabase";

import {
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  loginWithGoogle as authLoginWithGoogle,
  sendPasswordReset as authSendPasswordReset,
  updatePassword as authUpdatePassword,
  type LoginCredentials,
  type SignupCredentials,
} from "../services/auth.service";

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  /** True once the first auth state resolution has completed. */
  initialized: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginCredentials) => ReturnType<typeof authLogin>;
  signup: (payload: SignupCredentials) => ReturnType<typeof authSignup>;
  loginWithGoogle: () => ReturnType<typeof authLoginWithGoogle>;
  logout: () => Promise<{ error: unknown }>;
  sendPasswordReset: (email: string, redirectTo?: string) => ReturnType<typeof authSendPasswordReset>;
  updatePassword: (newPassword: string) => ReturnType<typeof authUpdatePassword>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider — mount once in providers.tsx
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    // onAuthStateChange fires immediately on subscription with the current
    // session, so it acts as both the initialiser and the ongoing listener.
    // This eliminates the race between a separate initialize() call and the
    // listener that existed in the previous implementation.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mountedRef.current) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);
      setIsLoading(false);
      setInitialized(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(
    (payload: LoginCredentials) => authLogin(payload),
    [],
  );

  const signup = useCallback(
    (payload: SignupCredentials) => authSignup(payload),
    [],
  );

  const loginWithGoogle = useCallback(
    () => authLoginWithGoogle(),
    [],
  );

  const logout = useCallback(async () => {
    const { error } = await authLogout();

    if (!error) {
      // Clear all cached server state so no data from the previous
      // user session leaks into the next one.
      queryClient.clear();
    }

    return { error };
  }, []);

  const sendPasswordReset = useCallback(
    (email: string, redirectTo?: string) => authSendPasswordReset(email, redirectTo),
    [],
  );

  const updatePassword = useCallback(
    (newPassword: string) => authUpdatePassword(newPassword),
    [],
  );

  const value: AuthContextValue = {
    user,
    session,
    isLoading,
    initialized,
    isAuthenticated: !!session,
    login,
    signup,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export default function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used inside <AuthProvider>. " +
        "Ensure AuthProvider is present in providers.tsx.",
    );
  }

  return ctx;
}