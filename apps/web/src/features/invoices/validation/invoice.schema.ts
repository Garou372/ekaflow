import { z } from "zod";

import { INVOICE_STATUSES } from "../types/invoice";

export const invoiceLineItemSchema = z.object({
  id: z.string().optional(),

  description: z.string().trim().min(1, "Description is required."),

  quantity: z.coerce.number().positive("Quantity must be greater than 0."),

  unitPrice: z.coerce.number().min(0, "Unit price cannot be negative."),
});

export const invoiceSchema = z
  .object({
    id: z.string().uuid().optional(),
    clientId: z.string().uuid({ message: "Client is required." }),
    proposalId: z.string().uuid().nullable().optional(),
    projectId: z.string().uuid().nullable().optional(),
    invoiceNumber: z.string().min(1, { message: "Invoice number is required." }),

    issueDate: z.string().min(1, "Issue date is required."),

    dueDate: z.string().min(1, "Due date is required."),

    status: z
      .enum([INVOICE_STATUSES[0], ...INVOICE_STATUSES.slice(1)])
      .default("draft"),

    lineItems: z
      .array(invoiceLineItemSchema)
      .min(1, "At least one invoice item is required."),

    discountRate: z.coerce
      .number()
      .min(0, "Discount cannot be negative.")
      .max(100, "Discount cannot exceed 100%")
      .default(0),

    taxRate: z.coerce
      .number()
      .min(0, "Tax cannot be negative.")
      .max(100, "Tax cannot exceed 100%")
      .default(0),

    notes: z.string().trim().nullish(),
  })
  .refine((data) => new Date(data.dueDate) >= new Date(data.issueDate), {
    message: "Due date cannot be before issue date.",
    path: ["dueDate"],
  });

export type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export type InvoiceLineItemFormValues = z.infer<typeof invoiceLineItemSchema>;
