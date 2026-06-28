import type { TimeEntry } from "../../time/types/time";
import type { InvoiceLineItem } from "../types/invoice";

export function timeEntriesToInvoiceLines(
  entries: TimeEntry[],
  hourlyRate: number | null
): InvoiceLineItem[] {
  const rate = hourlyRate || 0;
  
  // We can group by description to avoid cluttering the invoice with a million 5-minute entries.
  // Or just list them out. Let's group by description for a cleaner invoice.
  const grouped = entries.reduce((acc, entry) => {
    const key = entry.description;
    if (!acc[key]) {
      acc[key] = { duration_minutes: 0 };
    }
    acc[key].duration_minutes += (entry.duration_minutes || 0);
    return acc;
  }, {} as Record<string, { duration_minutes: number }>);

  return Object.entries(grouped).map(([description, data]) => {
    const hours = +(data.duration_minutes / 60).toFixed(2);
    return {
      id: crypto.randomUUID(),
      description,
      quantity: hours,
      unitPrice: rate,
      total: hours * rate,
    };
  });
}
