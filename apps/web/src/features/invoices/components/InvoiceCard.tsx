import { Eye, Pencil, Trash2 } from "lucide-react";

import type { InvoiceStatus, InvoiceWithRelations } from "../types/invoice";
import { STATUS_TRANSITIONS } from "../types/invoice";
import { formatCurrency } from "../utils/currency";

// ─── Status display config ────────────────────────────────────────

const STATUS_CONFIG: Record<InvoiceStatus, { label: string; cssClass: string }> = {
  draft:     { label: "Draft",     cssClass: "ek-badge ek-status-draft" },
  sent:      { label: "Sent",      cssClass: "ek-badge ek-status-sent" },
  paid:      { label: "Paid",      cssClass: "ek-badge ek-status-paid" },
  overdue:   { label: "Overdue",   cssClass: "ek-badge ek-status-overdue" },
  cancelled: { label: "Cancelled", cssClass: "ek-badge ek-status-cancelled" },
};

// ─── Types ────────────────────────────────────────────────────────

type Props = {
  invoice: InvoiceWithRelations;
  onView: (invoice: InvoiceWithRelations) => void;
  onEdit: (invoice: InvoiceWithRelations) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: InvoiceStatus) => Promise<void> | void;
  isUpdatingStatus?: boolean;
};

// ─── Component ────────────────────────────────────────────────────

export default function InvoiceCard({
  invoice,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
  isUpdatingStatus = false,
}: Props) {
  const { total } = invoice.totals;
  const validTransitions = STATUS_TRANSITIONS[invoice.status];
  const isTerminal = validTransitions.length === 0;
  const sc = STATUS_CONFIG[invoice.status];

  return (
    <div className="ek-card ek-card-hover flex flex-col">
      {/* ── Body ─────────────────────────────────── */}
      <div className="p-5 flex-1">
        {/* Invoice number + client + status */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p
              className="font-mono"
              style={{ fontSize: 11, color: "var(--ek-text-tertiary)", letterSpacing: "0.05em" }}
            >
              {invoice.invoiceNumber}
            </p>
            <h3
              className="font-bold truncate mt-0.5"
              style={{ fontSize: 16, color: "var(--ek-text-primary)" }}
            >
              {invoice.clientName}
            </h3>
          </div>

          {/* Status + transition */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span
              aria-label={`Status: ${sc.label}`}
              className={sc.cssClass}
            >
              {sc.label}
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
                className="ek-select"
                style={{ fontSize: 11, padding: "3px 28px 3px 8px" }}
              >
                <option value="" disabled>→ Move to</option>
                {validTransitions.map((next) => (
                  <option key={next} value={next}>
                    {STATUS_CONFIG[next].label}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Dates */}
        <div
          className="mt-4 space-y-2"
          style={{ fontSize: 13 }}
        >
          <div className="flex justify-between">
            <span style={{ color: "var(--ek-text-tertiary)" }}>Issue date</span>
            <span style={{ color: "var(--ek-text-secondary)", fontWeight: 500 }}>
              {invoice.issueDate}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: "var(--ek-text-tertiary)" }}>Due date</span>
            <span
              style={{
                color:
                  invoice.status === "overdue"
                    ? "var(--ek-danger)"
                    : "var(--ek-text-secondary)",
                fontWeight: 500,
              }}
            >
              {invoice.dueDate}
            </span>
          </div>
        </div>

        {/* Total */}
        <div
          className="flex justify-between items-baseline mt-4 pt-4"
          style={{ borderTop: "1px solid var(--ek-border)" }}
        >
          <span style={{ fontSize: 13, color: "var(--ek-text-tertiary)" }}>Total</span>
          <span
            className="font-bold"
            style={{ fontSize: 20, color: "var(--ek-text-primary)", fontVariantNumeric: "tabular-nums" }}
          >
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* ── Actions ──────────────────────────────── */}
      <div
        className="flex items-center justify-end gap-1 px-4 py-3"
        style={{
          borderTop: "1px solid var(--ek-border)",
          background: "var(--ek-bg-subtle)",
          borderRadius: "0 0 var(--ek-radius-card) var(--ek-radius-card)",
        }}
      >
        <button
          type="button"
          aria-label={`View invoice ${invoice.invoiceNumber}`}
          onClick={() => onView(invoice)}
          className="ek-btn-icon"
          title="Preview"
        >
          <Eye size={16} />
        </button>

        <button
          type="button"
          aria-label={`Edit invoice ${invoice.invoiceNumber}`}
          onClick={() => onEdit(invoice)}
          className="ek-btn-icon"
          style={{ color: "var(--ek-primary)" }}
          title="Edit"
        >
          <Pencil size={16} />
        </button>

        <button
          type="button"
          aria-label={`Delete invoice ${invoice.invoiceNumber}`}
          onClick={() => onDelete(invoice.id)}
          className="ek-btn-icon"
          style={{ color: "var(--ek-danger)" }}
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
