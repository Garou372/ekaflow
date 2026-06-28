import { Eye, Pencil, Trash2 } from "lucide-react";

import type { InvoiceStatus, InvoiceWithRelations } from "../types/invoice";
import { STATUS_TRANSITIONS } from "../types/invoice";
import { formatCurrency } from "../utils/currency";

// ─── Status display map ───────────────────────────────────────────────────────
// Colours stay co-located with the card so visual changes are made in one place.
const STATUS_STYLES: Record<InvoiceStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
  cancelled: "bg-gray-200 text-gray-600",
};

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  invoice: InvoiceWithRelations;
  onView: (invoice: InvoiceWithRelations) => void;
  onEdit: (invoice: InvoiceWithRelations) => void;
  onDelete: (id: string) => void;
  /** Called when the user selects a new status from the transition dropdown. */
  onStatusChange: (id: string, status: InvoiceStatus) => Promise<void> | void;
  /** True while this specific invoice's status mutation is in-flight. */
  isUpdatingStatus?: boolean;
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoiceCard({
  invoice,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdatingStatus = false,
}: Props) {
  // invoice.totals is pre-calculated by InvoicesPage via calculateInvoice()
  // (InvoiceWithRelations.totals). No need to recalculate here.
  const { total } = invoice.totals;

  const validTransitions = STATUS_TRANSITIONS[invoice.status];
  const isTerminal = validTransitions.length === 0;

  return (
    <div className="rounded-xl border bg-white shadow-sm transition-all hover:shadow-md">
      <div className="space-y-5 p-6">
        {/* Invoice number + client name */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-gray-500">{invoice.invoiceNumber}</p>

            <h3 className="mt-1 text-lg font-semibold">{invoice.clientName}</h3>
          </div>

          {/* Status badge + transition selector ─────────────────────────────
           * The badge shows the current status with colour coding.
           * The "→" dropdown (hidden for terminal statuses) lists valid
           * next states derived from STATUS_TRANSITIONS — the single source
           * of truth in types/invoice.ts.
           */}
          <div className="flex flex-col items-end gap-2">
            <span
              aria-label={`Status: ${STATUS_LABELS[invoice.status]}`}
              className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_STYLES[invoice.status]}`}
            >
              {STATUS_LABELS[invoice.status]}
            </span>

            {!isTerminal && (
              <select
                defaultValue=""
                disabled={isUpdatingStatus}
                aria-label={`Move ${invoice.invoiceNumber} to a new status`}
                aria-busy={isUpdatingStatus}
                onChange={(e) => {
                  if (e.target.value) {
                    void onStatusChange(invoice.id, e.target.value as InvoiceStatus);
                    e.target.value = "";
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer rounded border border-gray-200 py-0.5 pl-1 pr-5 text-xs text-gray-500 focus:outline-none disabled:cursor-wait disabled:opacity-50"
              >
                <option value="" disabled>
                  → Move to
                </option>

                {validTransitions.map((next) => (
                  <option key={next} value={next}>
                    {STATUS_LABELS[next]}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Dates + total */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Issue Date</span>

            <span>{invoice.issueDate}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">Due Date</span>

            <span>{invoice.dueDate}</span>
          </div>

          <div className="flex justify-between border-t pt-3 text-lg font-semibold">
            <span>Total</span>

            <span>{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-6 py-4">
        <button
          type="button"
          aria-label={`View invoice ${invoice.invoiceNumber}`}
          onClick={() => onView(invoice)}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-200"
        >
          <Eye size={18} />
        </button>

        <button
          type="button"
          aria-label={`Edit invoice ${invoice.invoiceNumber}`}
          onClick={() => onEdit(invoice)}
          className="rounded-lg p-2 text-indigo-600 transition hover:bg-indigo-50"
        >
          <Pencil size={18} />
        </button>

        <button
          type="button"
          aria-label={`Delete invoice ${invoice.invoiceNumber}`}
          onClick={() => onDelete(invoice.id)}
          className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
