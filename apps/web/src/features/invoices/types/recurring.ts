import { InvoiceItem } from "./invoice";

export type RecurringFrequency = "weekly" | "monthly" | "yearly";
export type RecurringStatus = "active" | "paused" | "cancelled";

export interface RecurringInvoice {
  id: string;
  client_id: string;
  project_id: string | null;
  frequency: RecurringFrequency;
  next_run_date: string; // YYYY-MM-DD
  last_run_date: string | null; // YYYY-MM-DD
  status: RecurringStatus;
  template_data: {
    items: InvoiceItem[];
    taxRate: number;
    discountRate: number;
    notes?: string;
  };
  created_at: string;
}

export type CreateRecurringInvoicePayload = Omit<RecurringInvoice, "id" | "last_run_date" | "created_at">;
