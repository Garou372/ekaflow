import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const { isLoading, initialized, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading || !initialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200"
          style={{ borderTopColor: "var(--ek-primary, #4F46E5)" }}
          aria-label="Loading"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Pass the attempted location so LoginPage can redirect back after sign-in.
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
