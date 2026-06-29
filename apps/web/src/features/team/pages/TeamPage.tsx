import { useState } from "react";
import { Users, Mail, UserPlus, Shield } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import { useTeam } from "../../../hooks/useTeam";
import { useWorkspaceContext } from "../../../hooks/useWorkspace";
import InviteMemberModal from "./InviteMemberModal";
import EmptyState from "../../../components/common/EmptyState";
import LoadingPage from "../../../components/common/LoadingPage";

// ─── Component ────────────────────────────────────────────────────

function formatInviteExpiry(expiresAt: string | null | undefined) {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return "Invite expired";
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return days <= 1 ? "Expires today" : `Expires in ${days} days`;
}

export default function TeamPage() {
  const { members, isLoading } = useTeam();
  const { activeWorkspace, isLoading: isWorkspaceLoading } =
    useWorkspaceContext();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  if (isWorkspaceLoading) return <LoadingPage />;
  if (!activeWorkspace) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Management"
        description={`Manage members in ${activeWorkspace.name}`}
      >
        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="ek-btn ek-btn-primary ek-btn-md"
        >
          <UserPlus size={16} />
          Invite Member
        </button>
      </PageHeader>

      {/* Members Table / States */}
      <div className="ek-card overflow-hidden">
        {isLoading ? (
          <LoadingPage />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No team members yet"
            description="Invite colleagues or freelancers to collaborate in your workspace."
            action={
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="ek-btn ek-btn-primary ek-btn-md"
              >
                <UserPlus size={15} />
                Invite First Member
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              {/* Table head */}
              <thead>
                <tr
                  style={{
                    background: "var(--ek-bg-subtle)",
                    borderBottom: "1px solid var(--ek-border)",
                  }}
                >
                  {["Member", "Role", "Status"].map((col) => (
                    <th
                      key={col}
                      className="px-5 py-3"
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--ek-text-tertiary)",
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Table body */}
              <tbody>
                {members.map((member) => {
                  const displayName =
                    member.profiles?.full_name || "Pending user";
                  const displayEmail =
                    member.profiles?.email || member.invited_email || "";
                  const initial = (
                    displayName.charAt(0) ||
                    displayEmail.charAt(0) ||
                    "?"
                  ).toUpperCase();
                  const isActive = !!member.user_id;

                  return (
                    <tr
                      key={member.id}
                      style={{ borderBottom: "1px solid var(--ek-border)" }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "var(--ek-bg-subtle)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLTableRowElement
                        ).style.background = "transparent";
                      }}
                    >
                      {/* Member info */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
                            style={{
                              background: "var(--ek-primary-50)",
                              color: "var(--ek-primary)",
                            }}
                          >
                            {initial}
                          </div>
                          <div>
                            <div
                              className="font-semibold"
                              style={{
                                fontSize: 14,
                                color: "var(--ek-text-primary)",
                              }}
                            >
                              {displayName}
                            </div>
                            <div
                              className="flex items-center gap-1"
                              style={{
                                fontSize: 12,
                                color: "var(--ek-text-tertiary)",
                              }}
                            >
                              <Mail size={11} />
                              {displayEmail}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-5 py-4">
                        <div
                          className="flex items-center gap-1.5"
                          style={{
                            fontSize: 13,
                            color: "var(--ek-text-secondary)",
                          }}
                        >
                          <Shield
                            size={13}
                            style={{ color: "var(--ek-text-tertiary)" }}
                          />
                          <span className="capitalize">{member.role}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {isActive ? (
                          <span className="ek-badge ek-status-active">
                            Active
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className="ek-badge ek-status-pending flex items-center gap-1"
                              style={{ display: "inline-flex" }}
                            >
                              <Mail size={11} />
                              Pending
                            </span>
                            {formatInviteExpiry(
                              (member as any).invite_expires_at,
                            ) && (
                              <span
                                style={{
                                  fontSize: 12,
                                  color: "var(--ek-text-tertiary)",
                                }}
                              >
                                {formatInviteExpiry(
                                  (member as any).invite_expires_at,
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
