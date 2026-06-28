import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray, useWatch } from "react-hook-form";

import InvoiceDetails from "./InvoiceDetails";
import InvoiceItems from "./InvoiceItems";
import InvoiceSummary from "./InvoiceSummary";
import InvoicePreview from "./InvoicePreview";

import {
  invoiceSchema,
  type InvoiceFormValues,
} from "../validation/invoice.schema";

import type { Invoice, CreateInvoiceInput } from "../types/invoice";

// ─── Types ────────────────────────────────────────────────────────────────────

type Client = {
  id: string;
  name: string;
};

type Props = {
  clients: Client[];
  isSubmitting: boolean;
  nextInvoiceNumber: string;
  /** Populated when editing an existing saved invoice. */
  initialValues?: Invoice;
  /** Populated when converting an accepted proposal. */
  conversionValues?: CreateInvoiceInput;
  onSubmit: (data: CreateInvoiceInput) => Promise<void> | void;
  onClose: () => void;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function today(): string {
  return new Date().toISOString().split("T")[0];
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InvoiceEditor({
  clients,
  isSubmitting,
  nextInvoiceNumber,
  initialValues,
  conversionValues,
  onSubmit,
  onClose,
}: Props) {
  const isEditing = !!initialValues;
  const isConverting = !!conversionValues;
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialValues
      ? {
          clientId: initialValues.clientId,
          proposalId: initialValues.proposalId,
          projectId: initialValues.projectId,
          invoiceNumber: initialValues.invoiceNumber,
          issueDate: initialValues.issueDate,
          dueDate: initialValues.dueDate,
          status: initialValues.status,
          lineItems: initialValues.lineItems,
          discountRate: initialValues.discountRate,
          taxRate: initialValues.taxRate,
          notes: initialValues.notes ?? "",
        }
      : conversionValues
        ? {
            clientId: conversionValues.clientId,
            proposalId: conversionValues.proposalId ?? null,
            projectId: conversionValues.projectId ?? null,
            invoiceNumber: conversionValues.invoiceNumber,
            issueDate: conversionValues.issueDate,
            dueDate: conversionValues.dueDate,
            status: conversionValues.status ?? "draft",
            lineItems: conversionValues.lineItems,
            discountRate: conversionValues.discountRate,
            taxRate: conversionValues.taxRate,
            notes: conversionValues.notes ?? "",
          }
        : {
            clientId: "",
            proposalId: null,
            projectId: null,
            invoiceNumber: nextInvoiceNumber,
            issueDate: today(),
            dueDate: "",
            status: "draft" as const,
            lineItems: [{ description: "", quantity: 1, unitPrice: 0 }],
            discountRate: 0,
            taxRate: 0,
            notes: "",
          },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  // useWatch({ control }) subscribes only to the preview column's render cycle.
  // watch (from useForm) is kept separately because InvoiceSummary uses it
  // internally via watch("lineItems") / watch("discountRate") / watch("taxRate").
  // All totals are computed inside InvoicePreview by the shared calculateInvoice()
  // utility — no duplication of calculation logic.
  const formData = useWatch({ control }) as InvoiceFormValues;

  // Close the modal on Escape key — keyboard accessibility
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function submit(data: InvoiceFormValues) {
    const input: CreateInvoiceInput = {
      clientId: data.clientId,
      proposalId: data.proposalId ?? null,
      projectId: data.projectId ?? null,
      invoiceNumber: data.invoiceNumber,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: data.status,
      lineItems: data.lineItems,
      discountRate: data.discountRate,
      taxRate: data.taxRate,
      notes: data.notes ?? null,
    };

    await onSubmit(input);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-editor-title"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-8"
      onClick={onClose}
    >
      <div
        className="mb-8 w-full max-w-6xl rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-5">
          <h2 id="invoice-editor-title" className="text-xl font-semibold">
            {isConverting
              ? "New Invoice from Proposal"
              : isEditing
                ? "Edit Invoice"
                : "New Invoice"}
          </h2>

          <button
            type="button"
            aria-label="Close invoice editor"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)}>
          {/* Mobile Tab Toggle */}
          <div className="flex border-b lg:hidden">
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-medium ${mobileTab === "edit" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`}
              onClick={() => setMobileTab("edit")}
            >
              Edit
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-sm font-medium ${mobileTab === "preview" ? "border-b-2 border-indigo-600 text-indigo-600" : "text-gray-500"}`}
              onClick={() => setMobileTab("preview")}
            >
              Preview
            </button>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-2">
            {/* ── Left column: form sections ─────────────────────────── */}
            <div className={`space-y-6 ${mobileTab === "edit" ? "block" : "hidden"} lg:block`}>
              {/* Details: client, invoice number, dates, status */}
              <InvoiceDetails
                register={register}
                errors={errors}
                clients={clients}
              />

              {/* Line items with field array */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Line Items</h2>
                </div>

                <InvoiceItems
                  fields={fields}
                  register={register}
                  remove={remove}
                  append={append}
                />

                {errors.lineItems && (
                  <p className="mt-2 text-sm text-red-600">
                    {typeof errors.lineItems.message === "string"
                      ? errors.lineItems.message
                      : "At least one item is required."}
                  </p>
                )}
              </div>

              {/* Discount & tax */}
              <div className="rounded-xl border bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold">Totals</h2>

                <InvoiceSummary register={register} watch={watch} />
              </div>

              {/* Notes */}
              <div className="rounded-xl border bg-white p-6 shadow-sm space-y-2">
                <label htmlFor="invoice-notes" className="text-sm font-medium">
                  Notes{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>

                <textarea
                  id="invoice-notes"
                  rows={4}
                  {...register("notes")}
                  placeholder="Additional notes for the client..."
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* ── Right column: live preview ──────────────────────────── */}
            <div className={`${mobileTab === "preview" ? "block" : "hidden"} lg:block`}>
              <p className="mb-3 hidden lg:block text-xs font-semibold uppercase tracking-wide text-gray-400">
                Live Preview
              </p>

              <InvoicePreview data={formData} clients={clients} />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex justify-end gap-3 border-t bg-gray-50 p-5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border px-4 py-2 hover:bg-gray-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
