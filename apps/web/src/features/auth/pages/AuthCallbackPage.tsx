import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import useAuth from "../../../hooks/useAuth";

/**
 * Handles two Supabase redirect flows that both land on /auth/callback:
 *
 * 1. OAuth (Google) — existing behaviour: exchange tokens, navigate to /.
 * 2. Password recovery — new: Supabase sets event "PASSWORD_RECOVERY" when
 *    the user follows a reset link. Show a new-password form so they can
 *    call updatePassword() while the recovery session is active.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();

  const [mode, setMode] = useState<"loading" | "recovery" | "error">("loading");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        // Recovery session is now active — show the reset form.
        setMode("recovery");
        return;
      }

      if (event === "SIGNED_IN" && session) {
        // OAuth sign-in completed successfully.
        navigate("/");
        return;
      }
    });

    // Fallback: if neither event fires within a short window (e.g. the URL
    // hash was already consumed by a prior load), check for an existing
    // session and redirect accordingly.
    const fallback = setTimeout(async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setErrorMessage(error?.message ?? null);
        setMode("error");
      } else {
        navigate("/");
      }
    }, 3000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, [navigate]);

  async function handlePasswordUpdate(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setFormError("Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await updatePassword(newPassword);

      if (error) {
        setFormError(
          typeof error === "string"
            ? error
            : ((error as Error).message ?? "Failed to update password."),
        );
      } else {
        navigate("/");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Password recovery form ───────────────────────────────────────────────

  if (mode === "recovery") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1">
            <h2
              className="text-2xl font-bold"
              style={{ color: "var(--ek-text-primary, #0F172A)" }}
            >
              Set a new password
            </h2>
            <p
              className="text-sm"
              style={{ color: "var(--ek-text-secondary, #64748B)" }}
            >
              Choose a strong password for your account.
            </p>
          </div>

          <form
            onSubmit={handlePasswordUpdate}
            className="space-y-4"
            noValidate
          >
            <div className="space-y-1.5">
              <label
                htmlFor="new-password"
                className="block text-sm font-medium"
                style={{ color: "var(--ek-text-primary, #0F172A)" }}
              >
                New password
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="ek-input w-full"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium"
                style={{ color: "var(--ek-text-primary, #0F172A)" }}
              >
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ek-input w-full"
                disabled={isSubmitting}
              />
            </div>

            {formError && (
              <p className="text-sm text-red-600" role="alert">
                {formError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !newPassword || !confirmPassword}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--ek-primary, #4F46E5)" }}
            >
              {isSubmitting ? "Updating…" : "Update password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Error state ──────────────────────────────────────────────────────────

  if (mode === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center space-y-4">
          <p className="text-gray-700 font-medium">
            {errorMessage ?? "This link is invalid or has expired."}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="text-sm font-medium"
            style={{ color: "var(--ek-primary, #4F46E5)" }}
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  // ── Loading / OAuth in progress ──────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-t-transparent animate-spin"
          style={{
            borderColor: "var(--ek-primary, #4F46E5)",
            borderTopColor: "transparent",
          }}
        />
        <p className="text-gray-600 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}
