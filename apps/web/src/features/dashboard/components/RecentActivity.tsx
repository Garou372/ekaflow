import { FileText, FileCheck } from "lucide-react";
import type { InvoiceWithRelations } from "../../invoices/types/invoice";
import type { Proposal } from "../../../services/proposal.service";
import type { Client } from "../../../services/client.service";

type RecentActivityProps = {
  invoices: InvoiceWithRelations[];
  proposals: Proposal[];
  clients: Client[];
};

export default function RecentActivity({ invoices, proposals, clients }: RecentActivityProps) {
  // Combine, sort, and slice to top 5
  const combined = [
    ...invoices.map((i) => ({
      id: i.id,
      type: "invoice" as const,
      title: i.invoiceNumber,
      clientName: i.clientName,
      status: i.status,
      date: new Date(i.createdAt),
    })),
    ...proposals.map((p) => ({
      id: p.id,
      type: "proposal" as const,
      title: p.title,
      clientName: clients.find((c) => c.id === p.client_id)?.name ?? "Unknown",
      status: p.status,
      date: new Date(p.created_at),
    })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>

      {combined.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-gray-500">
          No recent activity
        </div>
      ) : (
        <div className="space-y-4">
          {combined.map((item) => (
            <div key={item.id} className="flex items-start gap-4">
              <div
                className={`mt-0.5 rounded-full p-2 ${
                  item.type === "invoice" ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {item.type === "invoice" ? <FileText size={16} /> : <FileCheck size={16} />}
              </div>

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.type === "invoice" ? "Invoice" : "Proposal"}{" "}
                  <span className="text-gray-500 font-normal">for</span> {item.clientName}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{item.title}</span>
                  <span>•</span>
                  <span className="capitalize">{item.status}</span>
                  <span>•</span>
                  <span>{item.date.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
