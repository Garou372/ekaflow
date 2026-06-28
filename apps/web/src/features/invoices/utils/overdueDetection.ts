import type { Invoice } from "../types/invoice";

/**
 * Checks if an invoice is overdue based on today's date.
 * An invoice is overdue if its status is "sent" and the due date is in the past.
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
