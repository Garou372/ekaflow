import { supabase } from "../lib/supabase";
import type { RecurringInvoice, CreateRecurringInvoicePayload } from "../features/invoices/types/recurring";

export async function getRecurringInvoices() {
  const { data, error } = await supabase
    .from("recurring_invoices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as RecurringInvoice[];
}

export async function createRecurringInvoice(payload: CreateRecurringInvoicePayload) {
  const { data, error } = await supabase
    .from("recurring_invoices")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data as RecurringInvoice;
}

export async function updateRecurringInvoiceStatus(id: string, status: RecurringInvoice["status"]) {
  const { error } = await supabase
    .from("recurring_invoices")
    .update({ status })
    .eq("id", id);

  if (error) throw error;
}

export async function processDueRecurringInvoice(id: string, newNextRunDate: string, currentRunDate: string) {
  // Update last_run_date and next_run_date
  const { error } = await supabase
    .from("recurring_invoices")
    .update({ 
      last_run_date: currentRunDate,
      next_run_date: newNextRunDate 
    })
    .eq("id", id);

  if (error) throw error;
}
