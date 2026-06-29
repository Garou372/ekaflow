import { useState } from "react";
import { X, Mail, Shield } from "lucide-react";
import { useTeam } from "../../../hooks/useTeam";
import { useToast } from "../../../hooks/useToast";
import { type WorkspaceRole } from "../../../services/workspace.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ isOpen, onClose }: Props) {
  const { inviteMember, isInviting } = useTeam();
  const { success, error: showError } = useToast();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("employee");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    try {
      const invite = await inviteMember({ email: normalizedEmail, role });
      success(
        "Invite Sent",
        `An invitation has been sent to ${normalizedEmail}`,
      );
      // Show the token so the dev can test since email isn't real
      console.log(
        `INVITE URL: ${window.location.origin}/accept-invite/${invite.invite_token}`,
      );
      onClose();
      setEmail("");
      setRole("employee");
    } catch (err: any) {
      showError("Failed to invite member", err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">Invite Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <Mail
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border pl-10 pr-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="colleague@example.com"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="relative">
              <Shield
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                className="w-full rounded-lg border pl-10 pr-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 appearance-none bg-white"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              {role === "admin" &&
                "Admins have full access to billing and workspace settings."}
              {role === "manager" &&
                "Managers can create and manage projects, clients, and invoices."}
              {role === "employee" &&
                "Employees can only track time and manage their assigned tasks."}
            </p>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInviting || !email}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isInviting ? "Sending..." : "Send Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
