import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import type { InvoiceWithRelations } from "../types/invoice";

const paymentSchema = z.object({
  paymentDate: z.string().min(1, "Payment date is required."),
  paidAmount: z.number().min(0, "Amount must be greater than or equal to 0."),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

type PaymentModalProps = {
  invoice: InvoiceWithRelations;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
};

export default function PaymentModal({
  invoice,
  isSubmitting,
  onClose,
  onSubmit,
}: PaymentModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentDate: new Date().toISOString().split("T")[0],
      paidAmount: invoice.totals.total,
    },
  });

  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-16"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <h2 id="payment-modal-title" className="text-xl font-semibold">
            Record Payment
          </h2>

          <button
            type="button"
            aria-label="Close payment modal"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-5 p-6">
            <p className="text-sm text-gray-600">
              Record a payment for invoice <strong>{invoice.invoiceNumber}</strong>.
            </p>

            <div>
              <label htmlFor="payment-date" className="mb-2 block text-sm font-medium">
                Payment Date
              </label>

              <input
                id="payment-date"
                type="date"
                {...register("paymentDate")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"
              />

              {errors.paymentDate && (
                <p role="alert" className="mt-1 text-sm text-red-500">
                  {errors.paymentDate.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="paid-amount" className="mb-2 block text-sm font-medium">
                Amount Paid
              </label>

              <input
                id="paid-amount"
                type="number"
                step="0.01"
                {...register("paidAmount", { valueAsNumber: true })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"
              />

              {errors.paidAmount && (
                <p role="alert" className="mt-1 text-sm text-red-500">
                  {errors.paidAmount.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t bg-gray-50 p-5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
