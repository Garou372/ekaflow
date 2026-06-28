import { AlertCircle, CheckCircle, Bell } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import useInvoices from "../../../hooks/useInvoices";
import useProposals from "../../../hooks/useProposals";
import useClients from "../../../hooks/useClients";
import useProjects from "../../../hooks/useProjects";
import { useFollowUps, FollowUpItemCard } from "../utils/followUpEngine";
import type { FollowUpItem } from "../utils/followUpEngine";
import { useToast } from "../../../hooks/useToast";

export default function FollowUpPage() {
  const { invoices } = useInvoices();
  const { proposals } = useProposals();
  const { clients } = useClients();
  const { projects } = useProjects();
  const { info } = useToast();

  const followUps = useFollowUps(invoices, proposals, clients, projects);

  const urgentCount = followUps.filter((f) => f.priority === "urgent").length;
  const highCount = followUps.filter((f) => f.priority === "high").length;

  // Group by type
  const grouped = {
    overdue_invoice: followUps.filter((f) => f.type === "overdue_invoice"),
    unanswered_proposal: followUps.filter((f) => f.type === "unanswered_proposal"),
    follow_up_due: followUps.filter((f) => f.type === "follow_up_due"),
    upcoming_deadline: followUps.filter((f) => f.type === "upcoming_deadline"),
    inactive_client: followUps.filter((f) => f.type === "inactive_client"),
  };

  function handleAction(item: FollowUpItem) {
    info(
      `Action for: ${item.entityLabel}`,
      `Navigate to the relevant page to take action on this ${item.type.replace(/_/g, " ")}.`,
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-up Center"
        description="Stay on top of overdue items, unanswered proposals, and upcoming deadlines"
      />

      {/* Summary badges */}
      {followUps.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urgentCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700">
              <AlertCircle size={12} />
              {urgentCount} Urgent
            </div>
          )}
          {highCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
              <Bell size={12} />
              {highCount} High Priority
            </div>
          )}
          <div className="flex items-center gap-1.5 rounded-full border bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600">
            {followUps.length} total items
          </div>
        </div>
      )}

      {followUps.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-16 text-center">
          <CheckCircle size={48} className="mb-4 text-emerald-400" />
          <h3 className="text-xl font-semibold text-gray-900">You're all caught up!</h3>
          <p className="mt-2 text-sm text-gray-500">
            No overdue invoices, unanswered proposals, or pending follow-ups.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Overdue Invoices */}
          {grouped.overdue_invoice.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-700">
                <AlertCircle size={15} />
                Overdue Invoices ({grouped.overdue_invoice.length})
              </h2>
              <div className="space-y-2">
                {grouped.overdue_invoice.map((item) => (
                  <FollowUpItemCard key={item.id} item={item} onAction={handleAction} />
                ))}
              </div>
            </section>
          )}

          {/* Unanswered Proposals */}
          {grouped.unanswered_proposal.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-amber-700">
                Unanswered Proposals ({grouped.unanswered_proposal.length})
              </h2>
              <div className="space-y-2">
                {grouped.unanswered_proposal.map((item) => (
                  <FollowUpItemCard key={item.id} item={item} onAction={handleAction} />
                ))}
              </div>
            </section>
          )}

          {/* Follow-up Due */}
          {grouped.follow_up_due.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-orange-700">
                Follow-ups Due ({grouped.follow_up_due.length})
              </h2>
              <div className="space-y-2">
                {grouped.follow_up_due.map((item) => (
                  <FollowUpItemCard key={item.id} item={item} onAction={handleAction} />
                ))}
              </div>
            </section>
          )}

          {/* Upcoming Deadlines */}
          {grouped.upcoming_deadline.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-purple-700">
                Project Deadlines ({grouped.upcoming_deadline.length})
              </h2>
              <div className="space-y-2">
                {grouped.upcoming_deadline.map((item) => (
                  <FollowUpItemCard key={item.id} item={item} onAction={handleAction} />
                ))}
              </div>
            </section>
          )}

          {/* Inactive Clients */}
          {grouped.inactive_client.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold text-blue-700">
                Inactive Clients ({grouped.inactive_client.length})
              </h2>
              <div className="space-y-2">
                {grouped.inactive_client.map((item) => (
                  <FollowUpItemCard key={item.id} item={item} onAction={handleAction} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
