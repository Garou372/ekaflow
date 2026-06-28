import type { UseFormRegister, UseFormWatch } from "react-hook-form";

import type { InvoiceLineItem } from "../types/invoice";
import type { InvoiceFormValues } from "../validation/invoice.schema";

import { calculateInvoice } from "../utils/calculateInvoice";
import { formatCurrency } from "../utils/currency";

type Props = {
  register: UseFormRegister<InvoiceFormValues>;
  watch: UseFormWatch<InvoiceFormValues>;
};

export default function InvoiceSummary({ register, watch }: Props) {
  const lineItems = (watch("lineItems") ?? []) as InvoiceLineItem[];

  const discountRate = watch("discountRate") ?? 0;
  const taxRate = watch("taxRate") ?? 0;

  const totals = calculateInvoice(lineItems, discountRate, taxRate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Subtotal</span>
        <span>{formatCurrency(totals.subtotal)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label htmlFor="discountRate" className="text-gray-600">
          Discount (%)
        </label>

        <input
          id="discountRate"
          type="number"
          min={0}
          max={100}
          step="0.01"
          {...register("discountRate")}
          className="h-9 w-24 rounded-md border border-gray-300 px-2 text-right outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Discount Amount</span>

        <span>- {formatCurrency(totals.discountAmount)}</span>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label htmlFor="taxRate" className="text-gray-600">
          Tax (%)
        </label>

        <input
          id="taxRate"
          type="number"
          min={0}
          max={100}
          step="0.01"
          {...register("taxRate")}
          className="h-9 w-24 rounded-md border border-gray-300 px-2 text-right outline-none focus:border-gray-900"
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Tax Amount</span>

        <span>+ {formatCurrency(totals.taxAmount)}</span>
      </div>

      <div className="flex items-center justify-between border-t pt-4 text-lg font-bold">
        <span>Total</span>

        <span>{formatCurrency(totals.total)}</span>
      </div>
    </div>
  );
}
