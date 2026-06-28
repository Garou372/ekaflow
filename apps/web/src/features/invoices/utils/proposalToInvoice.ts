import type { Proposal } from "../../../services/proposal.service";
import type { CreateInvoiceInput } from "../types/invoice";

/**
 * BUSINESS RULE — Proposal → Invoice conversion
 * ─────────────────────────────────────────────
 * Proposals and Invoices use different models for tax and discount:
 *
 *   Proposal  → absolute ₹ amounts
 *     e.g.  subtotal = 10 000,  tax = 1 800,  discount = 500
 *
 *   Invoice   → percentage rates applied by calculateInvoice()
 *     e.g.  taxRate = 18 %,  discountRate = 5 %
 *
 * On conversion we back-calculate rates from the proposal's own numbers
 * so the invoice form is pre-filled with values that reproduce the same
 * totals. The user can review and adjust them before saving.
 *
 * Rounding: rates are rounded to 2 decimal places (e.g. 17.999… → 18.00).
 *
 * Edge cases:
 *   subtotal  = 0  → discountRate defaults to 0  (avoids ÷0)
 *   taxableBase = 0  → taxRate     defaults to 0  (avoids ÷0)
 *
 * Formula:
 *   discountRate = (discount  / subtotal)      × 100
 *   taxableBase  =  subtotal  − discount
 *   taxRate      = (tax       / taxableBase)   × 100
 *
 * Line-item field mapping (snake_case → camelCase):
 *   ProposalItem.unit_price  →  InvoiceLineItem.unitPrice
 *
 * proposalId is set on the resulting invoice so the link between the two
 * documents is preserved in the database.
 *
 * dueDate is intentionally left blank — it cannot be inferred from
 * proposal data and the user must fill it in before saving.
 */
export function proposalToInvoice(
  proposal: Proposal,
  nextInvoiceNumber: string,
): CreateInvoiceInput {
  const subtotal = proposal.subtotal;

  // discountRate = (absolute discount ÷ subtotal) × 100
  const discountRate =
    subtotal > 0
      ? Math.round((proposal.discount / subtotal) * 100 * 100) / 100
      : 0;

  // taxableBase is what remains after the discount is applied.
  // taxRate is calculated against this post-discount base — matching the
  // order used by calculateInvoice(): subtract discount first, then apply tax.
  const taxableBase = subtotal - proposal.discount;
  const taxRate =
    taxableBase > 0
      ? Math.round((proposal.tax / taxableBase) * 100 * 100) / 100
      : 0;

  return {
    clientId: proposal.client_id,
    proposalId: proposal.id,           // preserves the proposal → invoice link
    invoiceNumber: nextInvoiceNumber,
    issueDate: new Date().toISOString().split("T")[0],
    dueDate: "",                        // user must set — cannot be inferred
    status: "draft",
    lineItems: proposal.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unit_price,       // snake_case → camelCase
    })),
    discountRate,
    taxRate,
    notes: proposal.notes ?? "",
  };
}
