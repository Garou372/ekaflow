import { useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: resetError } = await sendPasswordReset(email.trim());

      if (resetError) {
        setError(
          typeof resetError === "string"
            ? resetError
            : ((resetError as Error).message ?? "Failed to send reset email."),
        );
      } else {
        setSubmitted(true);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-4 text-center">
        <h2
          className="text-xl font-semibold"
          style={{ color: "var(--ek-text-primary, #0F172A)" }}
        >
          Check your inbox
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--ek-text-secondary, #64748B)" }}
        >
          We sent a reset link to <strong>{email}</strong>. It expires in one
          hour.
        </p>
        <Link
          to="/login"
          className="inline-block text-sm font-medium"
          style={{ color: "var(--ek-primary, #4F46E5)" }}
        >
          ← Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2
          className="text-2xl font-bold"
          style={{ color: "var(--ek-text-primary, #0F172A)" }}
        >
          Forgot your password?
        </h2>
        <p
          className="text-sm"
          style={{ color: "var(--ek-text-secondary, #64748B)" }}
        >
          Enter your email and we'll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="block text-sm font-medium"
            style={{ color: "var(--ek-text-primary, #0F172A)" }}
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="ek-input w-full"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className="w-full py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: "var(--ek-primary, #4F46E5)" }}
        >
          {isSubmitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p
        className="text-center text-sm"
        style={{ color: "var(--ek-text-secondary, #64748B)" }}
      >
        Remember your password?{" "}
        <Link
          to="/login"
          className="font-medium"
          style={{ color: "var(--ek-primary, #4F46E5)" }}
        >
          Log in
        </Link>
      </p>
    </div>
  );
}
