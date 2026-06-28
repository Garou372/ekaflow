import { supabase } from "../lib/supabase";

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  fullName: string;
  email: string;
  password: string;
};

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();

  return {
    data: data.session,
    error,
  };
}

export async function getUser() {
  const { data, error } = await supabase.auth.getUser();

  return {
    data: data.user,
    error,
  };
}

export async function login({ email, password }: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    data,
    error,
  };
}

export async function signup({ fullName, email, password }: SignupCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  return {
    data,
    error,
  };
}

export async function loginWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  return { data, error };
}

export async function logout() {
  const { error } = await supabase.auth.signOut({ scope: "global" });

  return {
    error,
  };
}
