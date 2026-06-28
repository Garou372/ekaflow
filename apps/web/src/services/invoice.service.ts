import { supabase } from "../lib/supabase";

import type {
  CreateInvoiceInput,
  Invoice,
} from "../features/invoices/types/invoice";

type InvoiceRow = {
  id: string;
  user_id: string;
  client_id: string;
  proposal_id: string | null;

  invoice_number: string;

  issue_date: string;
  due_date: string;

  status: Invoice["status"];

  line_items: {
    id?: string;
    description: string;
    quantity: number;
    unit_price: number;
  }[];

  discount_rate: number | null;
  tax_rate: number | null;

  notes: string | null;

  paid_amount: number | null;

  payment_date: string | null;

  created_at: string;
  updated_at: string;
};

function mapInvoice(row: InvoiceRow): Invoice {
  return {
    id: row.id,

    userId: row.user_id,

    clientId: row.client_id,

    proposalId: row.proposal_id,

    invoiceNumber: row.invoice_number,

    issueDate: row.issue_date,

    dueDate: row.due_date,

    status: row.status,

    lineItems: (row.line_items ?? []).map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,
    })),

    discountRate: row.discount_rate ?? 0,

    taxRate: row.tax_rate ?? 0,

    notes: row.notes,

    paidAmount: row.paid_amount ?? 0,

    paymentDate: row.payment_date,

    createdAt: row.created_at,

    updatedAt: row.updated_at,
  };
}

function mapLineItems(items: CreateInvoiceInput["lineItems"]) {
  return items.map((item) => ({
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
  }));
}

export async function getInvoices() {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .order("created_at", {
      ascending: false,
    });

  return {
    data: ((data as InvoiceRow[] | null) ?? []).map(mapInvoice),
    error,
  };
}

export async function getInvoice(id: string) {
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  return {
    data: data ? mapInvoice(data as InvoiceRow) : null,
    error,
  };
}

export async function createInvoice(payload: CreateInvoiceInput) {
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      client_id: payload.clientId,

      proposal_id: payload.proposalId ?? null,

      invoice_number: payload.invoiceNumber,

      issue_date: payload.issueDate,

      due_date: payload.dueDate,

      status: payload.status ?? "draft",

      line_items: mapLineItems(payload.lineItems),

      discount_rate: payload.discountRate,

      tax_rate: payload.taxRate,

      notes: payload.notes ?? null,

      paid_amount: payload.paidAmount ?? 0,

      payment_date: payload.paymentDate ?? null,
    })
    .select()
    .single();

  return {
    data: data ? mapInvoice(data as InvoiceRow) : null,
    error,
  };
}

export async function updateInvoice(
  id: string,
  payload: Partial<CreateInvoiceInput>,
) {
  const dbPayload: Record<string, unknown> = {};

  if (payload.clientId !== undefined) dbPayload.client_id = payload.clientId;

  if (payload.proposalId !== undefined)
    dbPayload.proposal_id = payload.proposalId;

  if (payload.invoiceNumber !== undefined)
    dbPayload.invoice_number = payload.invoiceNumber;

  if (payload.issueDate !== undefined) dbPayload.issue_date = payload.issueDate;

  if (payload.dueDate !== undefined) dbPayload.due_date = payload.dueDate;

  if (payload.status !== undefined) dbPayload.status = payload.status;

  if (payload.lineItems !== undefined)
    dbPayload.line_items = mapLineItems(payload.lineItems);

  if (payload.discountRate !== undefined)
    dbPayload.discount_rate = payload.discountRate;

  if (payload.taxRate !== undefined) dbPayload.tax_rate = payload.taxRate;

  if (payload.notes !== undefined) dbPayload.notes = payload.notes;

  if (payload.paidAmount !== undefined)
    dbPayload.paid_amount = payload.paidAmount;

  if (payload.paymentDate !== undefined)
    dbPayload.payment_date = payload.paymentDate;

  const { data, error } = await supabase
    .from("invoices")
    .update(dbPayload)
    .eq("id", id)
    .select()
    .single();

  return {
    data: data ? mapInvoice(data as InvoiceRow) : null,
    error,
  };
}

export async function deleteInvoice(id: string) {
  const { error } = await supabase.from("invoices").delete().eq("id", id);

  return { error };
}
