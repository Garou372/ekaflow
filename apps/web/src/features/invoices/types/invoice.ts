/**
 * Single source of truth for all valid invoice statuses.
 *
 * Import INVOICE_STATUSES (and derive from it) instead of writing
 * status strings in more than one place. The Zod schema, filter dropdowns,
 * form selects, and status-transition logic all import from here.
 */
export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "overdue",
  "cancelled",
] as const;

export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

/**
 * Valid transitions for each invoice status.
 *
 * Lifecycle:
 *   draft ──→ sent  ──→ paid        (normal path)
 *         ╲       ╲→ overdue ──→ paid
 *          ╲──────────────────────→ cancelled
 *
 * Statuses mapped to an empty array are terminal — no further
 * transitions are allowed (paid, cancelled).
 */
export const STATUS_TRANSITIONS: Readonly<
  Record<InvoiceStatus, readonly InvoiceStatus[]>
> = {
  draft: ["sent", "cancelled"],
  sent: ["paid", "overdue", "cancelled"],
  paid: [], // terminal
  overdue: ["paid", "cancelled"],
  cancelled: [], // terminal
};

export interface InvoiceLineItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTotals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
}

export interface Invoice {
  id: string;

  userId: string;

  clientId: string;

  proposalId: string | null;

  projectId: string | null;

  invoiceNumber: string;

  issueDate: string;

  dueDate: string;

  status: InvoiceStatus;

  lineItems: InvoiceLineItem[];

  discountRate: number;

  taxRate: number;

  notes: string | null;

  paidAmount: number | null;

  paymentDate: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface CreateInvoiceInput {
  clientId: string;

  proposalId?: string | null;

  projectId?: string | null;

  invoiceNumber: string;

  issueDate: string;

  dueDate: string;

  status?: InvoiceStatus;

  lineItems: InvoiceLineItem[];

  discountRate: number;

  taxRate: number;

  notes?: string | null;

  paidAmount?: number | null;

  paymentDate?: string | null;
}

export interface UpdateInvoiceInput extends Partial<CreateInvoiceInput> {
  id: string;
}

export interface InvoiceWithRelations extends Invoice {
  clientName: string;

  totals: InvoiceTotals;
}
