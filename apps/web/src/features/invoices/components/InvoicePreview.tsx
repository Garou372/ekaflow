import type { InvoiceLineItem } from "../types/invoice";
import type { InvoiceFormValues } from "../validation/invoice.schema";

import { calculateInvoice } from "../utils/calculateInvoice";
import { formatCurrency } from "../utils/currency";
import { getCompanyInfo } from "../../settings/utils/companyInfo";

type Client = {
  id: string;
  name: string;
};

type Props = {
  data: InvoiceFormValues;
  clients: Client[];
};

export default function InvoicePreview({ data, clients }: Props) {
  const client = clients.find((c) => c.id === data.clientId);

  const totals = calculateInvoice(
    (data.lineItems ?? []) as InvoiceLineItem[],
    data.discountRate ?? 0,
    data.taxRate ?? 0,
  );

  const companyInfo = getCompanyInfo();

  return (
    <div className="rounded-xl border bg-white p-8 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-wide">INVOICE</h1>

          <p className="mt-2 text-sm text-gray-500">
            #{data.invoiceNumber || "-"}
          </p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold">{companyInfo.companyName}</p>
          
          <p className="text-sm text-gray-500 whitespace-pre-wrap mt-1">{companyInfo.address}</p>
          
          <p className="text-sm text-gray-500 mt-1">{companyInfo.email}</p>
          
          {companyInfo.website && (
            <p className="text-sm text-gray-500">{companyInfo.website}</p>
          )}
          
          {companyInfo.taxId && (
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Tax ID: {companyInfo.taxId}
            </p>
          )}
        </div>
      </div>

      {/* Client */}
      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Bill To
          </h3>

          <p className="font-medium">{client?.name ?? "Select Client"}</p>
        </div>

        <div className="text-right space-y-1">
          <p>
            <span className="font-medium">Issue:</span> {data.issueDate}
          </p>

          <p>
            <span className="font-medium">Due:</span> {data.dueDate}
          </p>

          <p>
            <span className="font-medium">Status:</span>{" "}
            {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-10">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-y bg-gray-50">
              <th className="px-4 py-3 text-left">Description</th>

              <th className="px-4 py-3 text-right">Qty</th>

              <th className="px-4 py-3 text-right">Unit Price</th>

              <th className="px-4 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {data.lineItems.map((item, index) => (
              <tr key={index} className="border-b">
                <td className="px-4 py-3">{item.description || "-"}</td>

                <td className="px-4 py-3 text-right">{item.quantity}</td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(item.unitPrice)}
                </td>

                <td className="px-4 py-3 text-right">
                  {formatCurrency(totals.itemTotals[index] ?? 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="mt-8 ml-auto w-full max-w-sm space-y-3">
        <div className="flex justify-between">
          <span>Subtotal</span>

          <span>{formatCurrency(totals.subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span>Discount ({data.discountRate}%)</span>

          <span>- {formatCurrency(totals.discountAmount)}</span>
        </div>

        <div className="flex justify-between">
          <span>Tax ({data.taxRate}%)</span>

          <span>{formatCurrency(totals.taxAmount)}</span>
        </div>

        <div className="flex justify-between border-t pt-4 text-xl font-bold">
          <span>Total</span>

          <span>{formatCurrency(totals.total)}</span>
        </div>
      </div>

      {/* Notes */}
      {data.notes && (
        <div className="mt-10 border-t pt-6">
          <h3 className="mb-2 font-semibold">Notes</h3>

          <p className="whitespace-pre-wrap text-gray-600">{data.notes}</p>
        </div>
      )}
    </div>
  );
}
