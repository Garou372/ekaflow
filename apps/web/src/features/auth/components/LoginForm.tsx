import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import { login, loginWithGoogle } from "../../../services/auth.service";

// ─── Schema ───────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Google Icon ──────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────

export default function LoginForm() {
  const navigate = useNavigate();
  const [authError, setAuthError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setAuthError("");
    const { error } = await login(data);
    if (error) {
      setAuthError(error.message);
      return;
    }
    navigate("/");
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    setAuthError("");
    const { error } = await loginWithGoogle();
    if (error) {
      setAuthError(error.message);
      setIsGoogleLoading(false);
    }
    // On success, Supabase redirects — no navigate() needed
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading || isSubmitting}
        className="ek-btn ek-btn-secondary ek-btn-md"
        style={{ width: "100%", fontWeight: 500 }}
      >
        <GoogleIcon />
        {isGoogleLoading ? "Connecting…" : "Continue with Google"}
      </button>

      {/* Divider */}
      <div
        className="flex items-center gap-3"
        style={{ color: "var(--ek-text-tertiary)" }}
      >
        <div className="ek-divider flex-1" />
        <span style={{ fontSize: 12, fontWeight: 500 }}>or continue with email</span>
        <div className="ek-divider flex-1" />
      </div>

      {/* Email */}
      <div>
        <label className="ek-label" htmlFor="login-email">
          Email address
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className="ek-input"
          placeholder="you@example.com"
          {...register("email")}
          aria-invalid={!!errors.email}
        />
        {errors.email && (
          <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--ek-danger)" }}>
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className="ek-label" htmlFor="login-password">
          Password
        </label>
        <div className="relative">
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="ek-input"
            placeholder="••••••••"
            style={{ paddingRight: 44 }}
            {...register("password")}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="ek-btn-icon"
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {showPassword
              ? <EyeOff size={16} />
              : <Eye size={16} />
            }
          </button>
        </div>
        {errors.password && (
          <p className="mt-1.5 text-xs font-medium" style={{ color: "var(--ek-danger)" }}>
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Auth error */}
      {authError && (
        <div
          className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium"
          style={{
            background: "var(--ek-danger-bg)",
            color: "var(--ek-danger)",
            border: "1.5px solid #FECACA",
          }}
        >
          {authError}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting || isGoogleLoading}
        className="ek-btn ek-btn-primary ek-btn-md"
        style={{ width: "100%", marginTop: 4 }}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent"
              style={{ animation: "ek-spin 0.8s linear infinite" }}
            />
            Signing in…
          </span>
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
