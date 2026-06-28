import type { InvoiceLineItem, InvoiceTotals } from "../types/invoice";

export interface CalculatedInvoice extends InvoiceTotals {
  itemTotals: number[];
}

const round = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

export function calculateInvoice(
  lineItems: InvoiceLineItem[],
  discountRate = 0,
  taxRate = 0,
): CalculatedInvoice {
  const itemTotals = lineItems.map((item) =>
    round(item.quantity * item.unitPrice),
  );

  const subtotal = round(itemTotals.reduce((sum, amount) => sum + amount, 0));

  const discountAmount = round(subtotal * (discountRate / 100));

  const taxableAmount = round(subtotal - discountAmount);

  const taxAmount = round(taxableAmount * (taxRate / 100));

  const total = round(taxableAmount + taxAmount);

  return {
    itemTotals,
    subtotal,
    discountAmount,
    taxAmount,
    total,
  };
}
