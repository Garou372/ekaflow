import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

/**
 * OAuth Callback Handler
 * Supabase redirects here after Google OAuth completes.
 * The Supabase client auto-processes the URL hash/params,
 * then we redirect based on whether auth succeeded.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase client automatically handles the OAuth tokens in the URL
    // We just need to wait for session and redirect
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("[AuthCallback] Error processing OAuth callback:", error);
        navigate("/login?error=oauth_failed");
        return;
      }

      if (data.session) {
        navigate("/");
      } else {
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-gray-600 font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}
