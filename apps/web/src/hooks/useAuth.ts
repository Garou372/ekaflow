import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

import {
  login as authLogin,
  signup as authSignup,
  logout as authLogout,
  getSession,
  getUser,
  type LoginCredentials,
  type SignupCredentials,
} from "../services/auth.service";

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initialize() {
      const { data: sessionData } = await getSession();
      const { data: userData } = await getUser();

      setSession(sessionData);
      setUser(userData);
      setIsLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async () => {
      const { data: sessionData } = await getSession();
      const { data: userData } = await getUser();

      setSession(sessionData);
      setUser(userData);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = useCallback(async (payload: LoginCredentials) => {
    return await authLogin(payload);
  }, []);

  const signup = useCallback(async (payload: SignupCredentials) => {
    return await authSignup(payload);
  }, []);

  const logout = useCallback(async () => {
    const { error } = await authLogout();

    if (error) {
      console.error(error);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    login,
    signup,
    logout,
  };
}
