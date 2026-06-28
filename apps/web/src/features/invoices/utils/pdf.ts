/**
 * pdf.ts — Invoice PDF-export utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Exports the invoice as a PDF by triggering the browser's built-in
 * "Save as PDF" print destination.
 *
 * How it works:
 *   All modern browsers (Chrome, Firefox, Safari, Edge) include "Save as PDF"
 *   in their native print dialog. This function opens a dedicated print window
 *   whose <title> is set to the invoice number — the browser uses the document
 *   title as the default PDF filename (e.g. "INV-2026-0001").
 *
 *   The rendered output is cloned directly from the InvoicePreview component
 *   via printInvoice() in print.ts. No second invoice template exists.
 *   All monetary totals come from calculateInvoice() inside InvoicePreview.
 *
 * Page settings (applied via @media print in print.ts):
 *   • Size:    A4 portrait
 *   • Margins: 15 mm on all sides
 *   • Colors:  print-color-adjust: exact (preserves status badge colours)
 *
 * @param elementId      id of the element wrapping InvoicePreview in the DOM
 * @param invoiceNumber  e.g. "INV-2026-0001" — used as the PDF filename
 */
import { printInvoice } from "./print";

export function exportInvoicePdf(
  elementId: string,
  invoiceNumber: string,
): void {
  // Passes invoiceNumber as the print-window title.
  // The browser's "Save as PDF" dialog will pre-fill this as the filename.
  printInvoice(elementId, invoiceNumber);
}
