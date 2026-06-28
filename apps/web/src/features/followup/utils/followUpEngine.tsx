import { useMemo } from "react";
import { Clock, FileText, User, Briefcase, ChevronRight } from "lucide-react";
import type { Invoice } from "../../invoices/types/invoice";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";
import type { Proposal } from "../../../services/proposal.service";
import type { Client } from "../../../services/client.service";
import type { Project } from "../../projects/types/project";
import { formatCurrency } from "../../invoices/utils/currency";

// ─── Follow-up Item Type ───────────────────────────────────────────────────────

export type FollowUpPriority = "urgent" | "high" | "normal";

export interface FollowUpItem {
  id: string;
  type: "overdue_invoice" | "unanswered_proposal" | "inactive_client" | "upcoming_deadline" | "follow_up_due";
  priority: FollowUpPriority;
  title: string;
  description: string;
  entityId: string;
  entityLabel: string;
  daysOverdue?: number;
}

// ─── Detection Logic ──────────────────────────────────────────────────────────

export function detectFollowUps(
  invoices: Invoice[],
  proposals: Proposal[],
  clients: Client[],
  projects: Project[],
): FollowUpItem[] {
  const items: FollowUpItem[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Overdue invoices
  for (const inv of invoices) {
    if (inv.status === "overdue") {
      const dueDate = new Date(inv.dueDate);
      const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);
      const clientName = clients.find(c => c.id === inv.clientId)?.name ?? "Unknown Client";
      const total = calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total;
      items.push({
        id: `overdue-${inv.id}`,
        type: "overdue_invoice",
        priority: daysOverdue > 30 ? "urgent" : daysOverdue > 7 ? "high" : "normal",
        title: `Overdue invoice ${inv.invoiceNumber}`,
        description: `${clientName} · ${formatCurrency(total)} · ${daysOverdue}d overdue`,
        entityId: inv.id,
        entityLabel: inv.invoiceNumber,
        daysOverdue,
      });
    }
    // Sent but no payment for > 14 days
    if (inv.status === "sent") {
      const dueDate = new Date(inv.dueDate);
      if (dueDate < today) {
        const daysOverdue = Math.floor((today.getTime() - dueDate.getTime()) / 86400000);
        const clientName = clients.find(c => c.id === inv.clientId)?.name ?? "Unknown Client";
        const total = calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total;
        items.push({
          id: `sent-overdue-${inv.id}`,
          type: "overdue_invoice",
          priority: "high",
          title: `Payment overdue: ${inv.invoiceNumber}`,
          description: `${clientName} · ${formatCurrency(total)} · Due ${daysOverdue}d ago`,
          entityId: inv.id,
          entityLabel: inv.invoiceNumber,
          daysOverdue,
        });
      }
    }
  }

  // 2. Unanswered proposals (sent for > 7 days)
  for (const proposal of proposals) {
    if (proposal.status === "sent") {
      const updatedAt = new Date(proposal.updated_at);
      const daysSinceSent = Math.floor((today.getTime() - updatedAt.getTime()) / 86400000);
      if (daysSinceSent >= 7) {
        const client = clients.find((c) => c.id === proposal.client_id);
        items.push({
          id: `proposal-${proposal.id}`,
          type: "unanswered_proposal",
          priority: daysSinceSent > 14 ? "high" : "normal",
          title: `No response: "${proposal.title}"`,
          description: `${client?.name ?? "Client"} · Sent ${daysSinceSent}d ago`,
          entityId: proposal.id,
          entityLabel: proposal.title,
        });
      }
    }
  }

  // 3. Follow-up dates due (from CRM)
  for (const client of clients) {
    if (client.next_follow_up_at) {
      const followUpDate = new Date(client.next_follow_up_at);
      if (followUpDate <= today) {
        const daysOverdue = Math.floor((today.getTime() - followUpDate.getTime()) / 86400000);
        items.push({
          id: `followup-${client.id}`,
          type: "follow_up_due",
          priority: daysOverdue > 3 ? "urgent" : "high",
          title: `Follow-up overdue: ${client.name}`,
          description: `Scheduled for ${followUpDate.toLocaleDateString("en-IN")} · ${daysOverdue}d overdue`,
          entityId: client.id!,
          entityLabel: client.name,
          daysOverdue,
        });
      }
    }

    // Inactive clients (no contact in 60+ days)
    if (client.last_contacted_at) {
      const lastContact = new Date(client.last_contacted_at);
      const daysSince = Math.floor((today.getTime() - lastContact.getTime()) / 86400000);
      if (daysSince >= 60) {
        items.push({
          id: `inactive-${client.id}`,
          type: "inactive_client",
          priority: "normal",
          title: `Inactive client: ${client.name}`,
          description: `No contact in ${daysSince} days`,
          entityId: client.id!,
          entityLabel: client.name,
        });
      }
    }
  }

  // 4. Projects with upcoming deadlines (within 7 days)
  for (const project of projects) {
    if (project.status !== "completed" && project.due_date) {
      const dueDate = new Date(project.due_date);
      const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / 86400000);
      if (daysUntilDue >= 0 && daysUntilDue <= 7) {
        items.push({
          id: `project-due-${project.id}`,
          type: "upcoming_deadline",
          priority: daysUntilDue <= 2 ? "urgent" : "high",
          title: `Deadline: ${project.name}`,
          description: `Due in ${daysUntilDue} day${daysUntilDue !== 1 ? "s" : ""}`,
          entityId: project.id,
          entityLabel: project.name,
        });
      }
      // Past due projects
      if (daysUntilDue < 0) {
        items.push({
          id: `project-overdue-${project.id}`,
          type: "upcoming_deadline",
          priority: "urgent",
          title: `Overdue project: ${project.name}`,
          description: `Was due ${Math.abs(daysUntilDue)} days ago`,
          entityId: project.id,
          entityLabel: project.name,
          daysOverdue: Math.abs(daysUntilDue),
        });
      }
    }
  }

  // Sort: urgent first, then by days overdue descending
  items.sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2 };
    const pDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (pDiff !== 0) return pDiff;
    return (b.daysOverdue ?? 0) - (a.daysOverdue ?? 0);
  });

  return items;
}

// ─── Follow-up Item Card ──────────────────────────────────────────────────────

const TYPE_CONFIG = {
  overdue_invoice: { icon: FileText, label: "Invoice", color: "text-red-500 bg-red-50" },
  unanswered_proposal: { icon: FileText, label: "Proposal", color: "text-amber-500 bg-amber-50" },
  inactive_client: { icon: User, label: "Client", color: "text-blue-500 bg-blue-50" },
  upcoming_deadline: { icon: Briefcase, label: "Project", color: "text-purple-500 bg-purple-50" },
  follow_up_due: { icon: Clock, label: "Follow-up", color: "text-orange-500 bg-orange-50" },
};

const PRIORITY_BADGE = {
  urgent: "border-red-200 bg-red-50 text-red-700",
  high: "border-amber-200 bg-amber-50 text-amber-700",
  normal: "border-gray-200 bg-gray-50 text-gray-600",
};

export function FollowUpItemCard({
  item,
  onAction,
}: {
  item: FollowUpItem;
  onAction?: (item: FollowUpItem) => void;
}) {
  const cfg = TYPE_CONFIG[item.type];
  const Icon = cfg.icon;

  return (
    <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cfg.color}`}>
        <Icon size={16} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${PRIORITY_BADGE[item.priority]}`}
          >
            {item.priority}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-gray-500 truncate">{item.description}</p>
      </div>

      {onAction && (
        <button
          onClick={() => onAction(item)}
          className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center gap-1 transition-colors"
        >
          Action <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useFollowUps(
  invoices: Invoice[],
  proposals: Proposal[],
  clients: Client[],
  projects: Project[],
) {
  return useMemo(
    () => detectFollowUps(invoices, proposals, clients, projects),
    [invoices, proposals, clients, projects],
  );
}
