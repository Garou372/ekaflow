import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1
          className="font-bold tracking-tight"
          style={{ fontSize: 28, color: "var(--ek-text-primary)" }}
        >
          Welcome back
        </h1>
        <p
          className="mt-1.5 text-sm"
          style={{ color: "var(--ek-text-secondary)" }}
        >
          Sign in to your EkaFlow workspace.
        </p>
      </div>

      {/* Form */}
      <LoginForm />

      {/* Footer link */}
      <p
        className="mt-6 text-center text-sm"
        style={{ color: "var(--ek-text-secondary)" }}
      >
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-semibold transition-colors"
          style={{ color: "var(--ek-primary)" }}
          onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "var(--ek-primary-hover)")}
          onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "var(--ek-primary)")}
        >
          Create account →
        </Link>
      </p>
    </div>
  );
}
