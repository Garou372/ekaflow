import type { Invoice } from "../types/invoice";
import { updateInvoiceStatus } from "../../../services/invoice.service";

/**
 * Returns true if a sent invoice's due date is strictly in the past.
 * Only "sent" invoices can become overdue (per STATUS_TRANSITIONS).
 */
export function isInvoiceOverdue(invoice: Invoice): boolean {
  if (invoice.status !== "sent" || !invoice.dueDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(invoice.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

/**
 * Given a list of invoices, transitions all overdue ones to "overdue" status
 * via the service layer so that STATUS_TRANSITIONS is enforced and audit logs
 * are emitted for each change.
 *
 * Returns a summary of how many were updated and any errors encountered.
 *
 * Intended to be called from a background sweep (e.g. on dashboard mount or
 * a scheduled job via job_queue) rather than inline in a render path.
 */
export async function markOverdueInvoices(
  invoices: Invoice[],
): Promise<{ updated: number; errors: string[] }> {
  const candidates = invoices.filter(isInvoiceOverdue);
  let updated = 0;
  const errors: string[] = [];

  for (const invoice of candidates) {
    const { error } = await updateInvoiceStatus(invoice.id, "overdue");
    if (error) {
      errors.push(`Invoice ${invoice.invoiceNumber}: ${error.message}`);
    } else {
      updated++;
    }
  }

  return { updated, errors };
}
