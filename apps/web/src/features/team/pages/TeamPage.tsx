import { useState } from "react";
import PageHeader from "../../../components/common/PageHeader";
import { useTeam } from "../../../hooks/useTeam";
import { useWorkspaceContext } from "../../../hooks/useWorkspace";
import { Users, Mail, UserPlus, Shield } from "lucide-react";
import InviteMemberModal from "./InviteMemberModal";

export default function TeamPage() {
  const { members, isLoading } = useTeam();
  const { activeWorkspace } = useWorkspaceContext();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (!activeWorkspace) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Team Management"
          description={`Manage members in ${activeWorkspace.name}`}
        />
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 w-full sm:w-auto justify-center"
        >
          <UserPlus size={16} />
          Invite Member
        </button>
      </div>

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="rounded-full bg-indigo-50 p-4 mb-4">
              <Users size={32} className="text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No team members yet</h3>
            <p className="mt-2 text-gray-500 max-w-sm">
              Invite colleagues or freelancers to collaborate in your workspace.
            </p>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
            >
              <UserPlus size={16} />
              Invite Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Member</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {members.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                          {member.profiles?.full_name?.charAt(0) || member.invited_email?.charAt(0) || "?"}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {member.profiles?.full_name || "Pending user"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {member.profiles?.email || member.invited_email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} className="text-gray-400" />
                        <span className="capitalize">{member.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {member.user_id ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 gap-1">
                          <Mail size={12} /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
