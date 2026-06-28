import { Link } from "react-router-dom";
import SignupForm from "../components/SignupForm";

export default function SignupPage() {
  return (
    <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>

        <p className="mt-2 text-sm text-gray-500">
          Start managing your freelance business with EkaFlow.
        </p>
      </div>

      <SignupForm />

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-indigo-600 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
