import { useMemo } from "react";
import { FileText, Briefcase, FileCheck, MessageSquare, Activity } from "lucide-react";
import type { Invoice } from "../../invoices/types/invoice";
import type { Proposal } from "../../../services/proposal.service";
import type { Project } from "../../projects/types/project";
import type { ClientNote } from "../../../services/client.service";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";
import { formatCurrency } from "../../invoices/utils/currency";

export type ClientTimelineProps = {
  invoices: Invoice[];
  proposals: Proposal[];
  projects: Project[];
  notes: ClientNote[];
};

type TimelineEvent = {
  id: string;
  type: "invoice" | "proposal" | "project" | "note";
  title: string;
  subtitle?: string;
  status?: string;
  date: Date;
  amount?: number;
};

export default function ClientTimeline({
  invoices,
  proposals,
  projects,
  notes,
}: ClientTimelineProps) {
  const timeline = useMemo(() => {
    const events: TimelineEvent[] = [
      ...invoices.map((i) => ({
        id: `inv-${i.id}`,
        type: "invoice" as const,
        title: `Invoice ${i.invoiceNumber}`,
        subtitle: i.status === "paid" && i.paymentDate ? `Paid on ${new Date(i.paymentDate).toLocaleDateString()}` : undefined,
        status: i.status,
        date: new Date(i.createdAt),
        amount: calculateInvoice(i.lineItems, i.discountRate, i.taxRate).total,
      })),
      ...proposals.map((p) => ({
        id: `prop-${p.id}`,
        type: "proposal" as const,
        title: `Proposal: ${p.title}`,
        status: p.status,
        date: new Date(p.created_at),
        amount: p.total || 0,
      })),
      ...projects.map((p) => ({
        id: `proj-${p.id}`,
        type: "project" as const,
        title: `Project: ${p.name}`,
        status: p.status,
        date: new Date(p.created_at || Date.now()),
      })),
      ...notes.map((n) => ({
        id: `note-${n.id}`,
        type: "note" as const,
        title: `Note: ${n.note_type}`,
        subtitle: n.content,
        date: new Date(n.created_at),
      })),
    ];

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [invoices, proposals, projects, notes]);

  const getIcon = (type: string) => {
    switch (type) {
      case "invoice":
        return <FileText size={16} className="text-blue-500" />;
      case "proposal":
        return <FileCheck size={16} className="text-indigo-500" />;
      case "project":
        return <Briefcase size={16} className="text-emerald-500" />;
      case "note":
        return <MessageSquare size={16} className="text-amber-500" />;
      default:
        return <Activity size={16} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
      case "accepted":
      case "completed":
        return "bg-emerald-100 text-emerald-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "sent":
      case "active":
        return "bg-blue-100 text-blue-800";
      case "rejected":
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (timeline.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
        No history available for this client.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 pb-4">
        {timeline.map((event) => (
          <div key={event.id} className="relative pl-6">
            <span className="absolute -left-[17px] flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-gray-50 shadow-sm">
              {getIcon(event.type)}
            </span>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div>
                <h4 className="font-semibold text-gray-900">{event.title}</h4>
                {event.subtitle && (
                  <p className="mt-1 text-sm text-gray-600 max-w-lg whitespace-pre-wrap">{event.subtitle}</p>
                )}
                <time className="mt-2 block text-xs text-gray-400">
                  {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </time>
              </div>

              <div className="flex items-center gap-3">
                {event.amount !== undefined && event.amount > 0 && (
                  <span className="font-medium text-gray-900">
                    {formatCurrency(event.amount)}
                  </span>
                )}
                {event.status && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${getStatusColor(
                      event.status,
                    )}`}
                  >
                    {event.status}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
