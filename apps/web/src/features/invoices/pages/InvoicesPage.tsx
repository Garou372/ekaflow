import { useCallback, useMemo, useState } from "react";

import { Download, Printer } from "lucide-react";

import PageHeader from "../../../components/common/PageHeader";
import InvoiceCard from "../components/InvoiceCard";
import InvoiceEditor from "../components/InvoiceEditor";
import InvoicePreview from "../components/InvoicePreview";
import RecurringInvoicesList from "../components/RecurringInvoicesList";
import PaymentModal, { type PaymentFormData } from "../components/PaymentModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";

import useInvoices from "../../../hooks/useInvoices";
import useRecurringInvoices from "../../../hooks/useRecurringInvoices";
import useClients from "../../../hooks/useClients";

import type {
  Invoice,
  InvoiceWithRelations,
  CreateInvoiceInput,
  InvoiceStatus,
} from "../types/invoice";
import type { InvoiceFormValues } from "../validation/invoice.schema";

import { INVOICE_STATUSES } from "../types/invoice";

import { calculateInvoice } from "../utils/calculateInvoice";
import { getNextInvoiceNumber } from "../utils/invoiceNumber";
import { printInvoice } from "../utils/print";
import { exportInvoicePdf } from "../utils/pdf";
import { isInvoiceOverdue } from "../utils/overdueDetection";

// ─── Status filter labels (UI-only — values come from INVOICE_STATUSES) ───────

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

// ─── Module-scope helpers ──────────────────────────────────────────────────────

/**
 * Pure mapping function — lifted to module scope so it is never recreated
 * on every render. Has no dependency on component state or props.
 */
function toFormValues(invoice: InvoiceWithRelations): InvoiceFormValues {
  return {
    clientId: invoice.clientId,
    proposalId: invoice.proposalId,
    invoiceNumber: invoice.invoiceNumber,
    issueDate: invoice.issueDate,
    dueDate: invoice.dueDate,
    status: invoice.status,
    lineItems: invoice.lineItems,
    discountRate: invoice.discountRate,
    taxRate: invoice.taxRate,
    notes: invoice.notes,
  };
}

// ─── Loading skeleton ──────────────────────────────────────────────────────────

function InvoiceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border bg-white shadow-sm">
      <div className="space-y-5 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="h-3 w-24 rounded bg-gray-200" />
            <div className="h-5 w-36 rounded bg-gray-200" />
          </div>
          <div className="h-6 w-16 rounded-full bg-gray-200" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-gray-100" />
          <div className="h-3 w-3/4 rounded bg-gray-100" />
          <div className="h-6 w-1/2 rounded bg-gray-200" />
        </div>
      </div>
      <div className="flex justify-end gap-2 border-t bg-gray-50 px-6 py-4">
        <div className="h-8 w-8 rounded-lg bg-gray-200" />
        <div className="h-8 w-8 rounded-lg bg-gray-200" />
        <div className="h-8 w-8 rounded-lg bg-gray-200" />
      </div>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const {
    invoices,
    isLoading,
    error,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateStatus,
    creating,
    updating,
    deleting,
  } = useInvoices();

  const { createRecurringInvoice } = useRecurringInvoices();

  const { clients } = useClients();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "recurring">("all");
  const [editingInvoice, setEditingInvoice] = useState<Invoice | undefined>();
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  // ── Enrich invoices with clientName + calculated totals ───────────────────
  const enriched = useMemo((): InvoiceWithRelations[] => {
    return invoices.map((invoice) => ({
      ...invoice,
      clientName:
        clients.find((c) => c.id === invoice.clientId)?.name ??
        "Unknown Client",
      totals: calculateInvoice(
        invoice.lineItems,
        invoice.discountRate,
        invoice.taxRate,
      ),
    }));
  }, [invoices, clients]);

  const viewingInvoice = useMemo(() => {
    return enriched.find((i) => i.id === viewingInvoiceId);
  }, [enriched, viewingInvoiceId]);

  const [recordingPaymentFor, setRecordingPaymentFor] = useState<
    InvoiceWithRelations | undefined
  >();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Tracks which invoice's status is currently being mutated so the card can
  // show its own loading state without blocking every other card.
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Derive next invoice number from the latest existing one ───────────────
  const nextInvoiceNumber = useMemo(
    () => getNextInvoiceNumber(invoices[0]?.invoiceNumber),
    [invoices],
  );

  // ── Auto-detect overdue invoices that are still marked "sent" ────────────
  const overdueUnmarked = useMemo(() => {
    return enriched.filter((inv) => isInvoiceOverdue(inv));
  }, [enriched]);

  // ── Filter by search text and status ─────────────────────────────────────
  const filtered = useMemo(() => {
    return enriched.filter((inv) => {
      const q = search.toLowerCase();
      const matchesSearch =
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q);
      const matchesStatus = statusFilter ? inv.status === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [enriched, search, statusFilter]);

  // ── Handlers (useCallback: stable references, avoid prop churn) ──────────

  const handleSubmit = useCallback(
    async (data: CreateInvoiceInput, recurring?: { frequency: "weekly" | "monthly" | "yearly" }) => {
      if (recurring) {
        await createRecurringInvoice({
          client_id: data.clientId,
          project_id: data.projectId ?? null,
          frequency: recurring.frequency,
          next_run_date: new Date().toISOString().split("T")[0],
          status: "active",
          template_data: {
            items: data.lineItems,
            taxRate: data.taxRate,
            discountRate: data.discountRate,
            notes: data.notes ?? undefined,
          },
        });
      } else if (editingInvoice) {
        await updateInvoice({ id: editingInvoice.id, payload: data });
      } else {
        await createInvoice(data);
      }
      setEditingInvoice(undefined);
      setOpen(false);
    },
    [editingInvoice, updateInvoice, createInvoice, createRecurringInvoice],
  );

  const handleEdit = useCallback((invoice: InvoiceWithRelations) => {
    setEditingInvoice(invoice);
    setOpen(true);
  }, []);

  const handleView = useCallback((invoice: InvoiceWithRelations) => {
    setViewingInvoiceId(invoice.id);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await deleteInvoice(deletingId);
    } finally {
      setDeletingId(null);
    }
  }, [deleteInvoice, deletingId]);

  const handleStatusChange = useCallback(
    async (id: string, status: InvoiceStatus) => {
      if (status === "paid") {
        const invoice = enriched.find((i) => i.id === id);
        if (invoice) {
          setRecordingPaymentFor(invoice);
          return;
        }
      }

      setUpdatingStatusId(id);
      try {
        await updateStatus({ id, status });
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [updateStatus, enriched],
  );

  const handlePaymentSubmit = useCallback(
    async (data: PaymentFormData) => {
      if (!recordingPaymentFor) return;

      setUpdatingStatusId(recordingPaymentFor.id);
      try {
        await updateInvoice({
          id: recordingPaymentFor.id,
          payload: {
            status: "paid",
            paidAmount: data.paidAmount,
            paymentDate: data.paymentDate,
          },
        });
      } finally {
        setUpdatingStatusId(null);
        setRecordingPaymentFor(undefined);
      }
    },
    [recordingPaymentFor, updateInvoice],
  );

  const closeEditor = useCallback(() => {
    setOpen(false);
    setEditingInvoice(undefined);
  }, []);

  const closeViewer = useCallback(() => {
    setViewingInvoiceId(null);
  }, []);

  const handleSyncOverdue = useCallback(async () => {
    // Updating them sequentially for simplicity; could use Promise.all
    for (const inv of overdueUnmarked) {
      await updateStatus({ id: inv.id, status: "overdue" });
    }
  }, [overdueUnmarked, updateStatus]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <PageHeader title="Invoices" description="Create and manage invoices.">
        <button
          type="button"
          onClick={() => {
            setEditingInvoice(undefined);
            setOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + New Invoice
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse border" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Overdue Banner ─────────────────────────────────────────────── */}
      {overdueUnmarked.length > 0 && (
        <div
          role="alert"
          className="flex items-center justify-between rounded-lg border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-800"
        >
          <div className="flex items-center gap-2">
            <strong>Action Required:</strong>
            <span>
              {overdueUnmarked.length} invoice(s) are past their due date but still marked as "Sent".
            </span>
          </div>

          <button
            type="button"
            onClick={handleSyncOverdue}
            disabled={updating}
            className="rounded-md bg-orange-600 px-3 py-1.5 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
          >
            {updating ? "Updating..." : "Mark as Overdue"}
          </button>
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────────────────── */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={`py-3 px-6 text-sm font-medium ${activeTab === "all" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          All Invoices
        </button>
        <button
          onClick={() => setActiveTab("recurring")}
          className={`py-3 px-6 text-sm font-medium ${activeTab === "recurring" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
        >
          Recurring Templates
        </button>
      </div>

      {activeTab === "all" ? (
        <>
          {/* ── Search & status filter ─────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              aria-label="Search invoices by number or client"
              placeholder="Search by invoice # or client..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Statuses</option>

          {INVOICE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* ── Error state ─────────────────────────────────────────────────── */}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <strong>Failed to load invoices.</strong>{" "}
          {error instanceof Error ? error.message : "Please try again."}
        </div>
      )}

      {/* ── Invoice list (aria-live so screen readers hear updates) ────── */}
      <div aria-live="polite" aria-atomic="false">
        {isLoading ? (
          <div
            aria-label="Loading invoices"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <InvoiceCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed p-12 text-center">
            <h3 className="text-xl font-semibold">No Invoices Found</h3>

            <p className="mt-2 text-gray-500">
              {search || statusFilter
                ? "No invoices match your filters."
                : "Create your first invoice to get started."}
            </p>

            {!search && !statusFilter && (
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
              >
                New Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((invoice) => (
              <InvoiceCard
                key={invoice.id}
                invoice={invoice}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                isUpdatingStatus={updatingStatusId === invoice.id}
              />
            ))}
          </div>
        )}
      </div>
      </>
      ) : (
        <RecurringInvoicesList />
      )}

      {/* ── Editor modal ──────────────────────────────────────────────── */}
      {open && (
        <InvoiceEditor
          clients={clients}
          isSubmitting={creating || updating}
          nextInvoiceNumber={nextInvoiceNumber}
          initialValues={editingInvoice}
          onSubmit={handleSubmit}
          onClose={closeEditor}
        />
      )}

      {/* ── View / Preview modal ──────────────────────────────────────── */}
      {viewingInvoice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-modal-title"
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8"
          onClick={closeViewer}
        >
          <div
            className="mb-8 w-full max-w-3xl rounded-xl bg-white shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: title + action buttons + close */}
            <div className="flex items-center justify-between border-b p-5">
              <h2 id="preview-modal-title" className="text-xl font-semibold">
                Invoice Preview
              </h2>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => printInvoice("invoice-preview-print")}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                >
                  <Printer size={16} />
                  Print
                </button>

                <button
                  type="button"
                  onClick={() =>
                    exportInvoicePdf(
                      "invoice-preview-print",
                      viewingInvoice.invoiceNumber,
                    )
                  }
                  className="flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700"
                >
                  <Download size={16} />
                  Export PDF
                </button>

                <button
                  type="button"
                  aria-label="Close preview"
                  onClick={closeViewer}
                  className="ml-2 rounded-md p-2 text-gray-500 hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Body: InvoicePreview wrapped in a printable target element */}
            <div className="p-6">
              {/*
               * id="invoice-preview-print" is the DOM target for printInvoice()
               * and exportInvoicePdf(). Only this element is cloned into the
               * print window — the modal chrome (header, padding) is excluded.
               */}
              <div id="invoice-preview-print">
                <InvoicePreview
                  data={toFormValues(viewingInvoice)}
                  clients={clients}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment modal ──────────────────────────────────────────────── */}
      {recordingPaymentFor && (
        <PaymentModal
          invoice={recordingPaymentFor}
          isSubmitting={updating}
          onClose={() => setRecordingPaymentFor(undefined)}
          onSubmit={handlePaymentSubmit}
        />
      )}

        </>
      )}

      {/* ── Delete confirmation modal ──────────────────────────────────── */}
      {deletingId && (
        <DeleteConfirmModal
          title="Delete Invoice"
          description="Are you sure you want to delete this invoice? This action cannot be undone."
          isDeleting={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
