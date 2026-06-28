import { useEffect } from "react";
import { FileText, FileCheck, X } from "lucide-react";
import type { Client } from "../../../services/client.service";
import type { Invoice } from "../../invoices/types/invoice";
import type { Proposal } from "../../../services/proposal.service";
import { formatCurrency } from "../../invoices/utils/currency";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";

type ClientHistoryModalProps = {
  client: Client;
  invoices: Invoice[];
  proposals: Proposal[];
  onClose: () => void;
};

export default function ClientHistoryModal({
  client,
  invoices,
  proposals,
  onClose,
}: ClientHistoryModalProps) {
  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Combine and sort chronological descending
  const timeline = [
    ...invoices
      .filter((i) => i.clientId === client.id)
      .map((i) => ({
        id: `inv-${i.id}`,
        type: "invoice" as const,
        title: `Invoice ${i.invoiceNumber}`,
        status: i.status,
        date: new Date(i.createdAt),
        amount: calculateInvoice(i.lineItems, i.discountRate, i.taxRate).total,
      })),
    ...proposals
      .filter((p) => p.client_id === client.id)
      .map((p) => ({
        id: `prop-${p.id}`,
        type: "proposal" as const,
        title: `Proposal: ${p.title}`,
        status: p.status,
        date: new Date(p.created_at),
        amount: p.budget || 0,
      })),
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-history-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white shadow-xl animate-in slide-in-from-right duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 id="client-history-title" className="text-xl font-semibold">
              Client History
            </h2>
            <p className="text-sm text-gray-500">{client.name}</p>
          </div>
          <button
            type="button"
            aria-label="Close history"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {timeline.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-500 text-center">
              <p>No history found for this client.</p>
            </div>
          ) : (
            <div className="relative border-l border-gray-200 ml-3 space-y-8 pb-8">
              {timeline.map((item) => (
                <div key={item.id} className="relative pl-6">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-4 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-white ${
                      item.type === "invoice" ? "bg-indigo-100 text-indigo-600" : "bg-emerald-100 text-emerald-600"
                    }`}
                  >
                    {item.type === "invoice" ? <FileText size={14} /> : <FileCheck size={14} />}
                  </div>

                  <div className="rounded-lg border bg-gray-50 p-4">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                      <span>{item.date.toLocaleDateString()}</span>
                      <span className="capitalize rounded-full px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium">
                        {item.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
