import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>

        <p className="mt-2 text-sm text-gray-500">
          Sign in to continue to EkaFlow.
        </p>
      </div>

      <LoginForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link
          to="/signup"
          className="font-medium text-indigo-600 hover:underline"
        >
          Create Account
        </Link>
      </p>
    </div>
  );
}
