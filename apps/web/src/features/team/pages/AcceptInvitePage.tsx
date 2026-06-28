import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../../../lib/supabase";
import useAuth from "../../../hooks/useAuth";
import { useToast } from "../../../hooks/useToast";
import { Briefcase, CheckCircle, XCircle, ArrowRight, Loader2 } from "lucide-react";

export default function AcceptInvitePage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<{ name: string; role: string } | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    async function verifyToken() {
      if (!token) return;
      try {
        const { data, error } = await supabase
          .from("workspace_members")
          .select("id, role, workspaces (name)")
          .eq("invite_token", token)
          .single();

        if (error || !data) {
          throw new Error("Invalid or expired invitation token.");
        }

        setWorkspace({
          name: (data.workspaces as any).name,
          role: data.role,
        });
        setMemberId(data.id);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Save token to session storage and redirect to login/signup
      sessionStorage.setItem("pending_invite_token", token!);
      navigate("/signup");
      return;
    }

    if (!memberId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("workspace_members")
        .update({
          user_id: user.id,
          invite_token: null,
          invite_expires_at: null,
          accepted_at: new Date().toISOString(),
        })
        .eq("id", memberId);

      if (error) throw error;

      success("Invitation Accepted", `You have joined ${workspace?.name}`);
      navigate("/");
    } catch (err: any) {
      showError("Failed to accept invite", err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 size={32} className="animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl text-center">
        {error ? (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
              <XCircle size={32} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Invitation</h1>
            <p className="text-gray-600 mb-8">{error}</p>
            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-6 text-indigo-600">
              <Briefcase size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Workspace</h1>
            <p className="text-gray-600 mb-8">
              You've been invited to join <strong>{workspace?.name}</strong> as an <strong>{workspace?.role}</strong>.
            </p>

            {!user && (
              <div className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800 text-left border border-amber-200">
                You need to create an account or log in to accept this invitation.
              </div>
            )}

            <button
              onClick={handleAccept}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              {user ? (
                <>
                  <CheckCircle size={18} />
                  Accept Invitation
                </>
              ) : (
                <>
                  Create Account to Join
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
