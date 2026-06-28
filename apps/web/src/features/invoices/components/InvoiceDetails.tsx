import type { FieldErrors, UseFormRegister } from "react-hook-form";

import type { InvoiceFormValues } from "../validation/invoice.schema";
import { INVOICE_STATUSES } from "../types/invoice";

type Client = {
  id: string;
  name: string;
};

type Props = {
  register: UseFormRegister<InvoiceFormValues>;
  errors: FieldErrors<InvoiceFormValues>;
  clients: Client[];
};

export default function InvoiceDetails({ register, errors, clients }: Props) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold">Invoice Details</h2>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Client */}
        <div className="space-y-2">
          <label htmlFor="invoice-client" className="text-sm font-medium">
            Client
          </label>

          <select
            id="invoice-client"
            {...register("clientId")}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select Client</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          {errors.clientId && (
            <p role="alert" className="text-sm text-red-600">
              {errors.clientId.message}
            </p>
          )}
        </div>

        {/* Invoice Number */}
        <div className="space-y-2">
          <label htmlFor="invoice-number" className="text-sm font-medium">
            Invoice Number
          </label>

          <input
            id="invoice-number"
            {...register("invoiceNumber")}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {errors.invoiceNumber && (
            <p role="alert" className="text-sm text-red-600">
              {errors.invoiceNumber.message}
            </p>
          )}
        </div>

        {/* Issue Date */}
        <div className="space-y-2">
          <label htmlFor="invoice-issue-date" className="text-sm font-medium">
            Issue Date
          </label>

          <input
            id="invoice-issue-date"
            type="date"
            {...register("issueDate")}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {errors.issueDate && (
            <p role="alert" className="text-sm text-red-600">
              {errors.issueDate.message}
            </p>
          )}
        </div>

        {/* Due Date */}
        <div className="space-y-2">
          <label htmlFor="invoice-due-date" className="text-sm font-medium">
            Due Date
          </label>

          <input
            id="invoice-due-date"
            type="date"
            {...register("dueDate")}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {errors.dueDate && (
            <p role="alert" className="text-sm text-red-600">
              {errors.dueDate.message}
            </p>
          )}
        </div>

        {/* Status */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="invoice-status" className="text-sm font-medium">
            Status
          </label>

          <select
            id="invoice-status"
            {...register("status")}
            className="w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {INVOICE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          {errors.status && (
            <p role="alert" className="text-sm text-red-600">
              {errors.status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
