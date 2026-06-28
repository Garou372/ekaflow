/**
 * print.ts — Invoice browser-print utility
 * ─────────────────────────────────────────────────────────────────────────────
 * Opens a dedicated print window containing only the rendered InvoicePreview
 * element, with all current-page styles transferred.
 *
 * Architecture rule:
 *   InvoicePreview is the single source of truth for the invoice layout.
 *   This utility clones its rendered DOM rather than introducing a second HTML
 *   template. All monetary totals in the printed output come from
 *   calculateInvoice() via the InvoicePreview component — no calculation logic
 *   lives here.
 *
 * Pop-ups:
 *   window.open() requires pop-ups to be allowed for this origin.
 *   If blocked, the user is alerted.
 *
 * Styles:
 *   Inline/injected <style> rules (Vite dev mode, compiled Tailwind bundles)
 *   are read directly via sheet.cssRules.
 *   Cross-origin linked sheets fall back to @import so the print window can
 *   fetch them independently.
 *
 * Timing:
 *   The 300 ms timeout gives the browser time to parse injected styles before
 *   the print dialog opens.
 */

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Clones `element` into a new browser window and opens the native print dialog.
 *
 * @param element  The live DOM element to print (wraps InvoicePreview)
 * @param title    Becomes the <title> of the print window; browsers use this
 *                 as the default filename in "Save as PDF" dialogs
 */
function openPrintWindow(element: HTMLElement, title: string): void {
  const win = window.open("", "_blank", "width=900,height=700");

  if (!win) {
    alert(
      "Pop-ups are blocked. Please allow pop-ups for this page to print or export invoices.",
    );
    return;
  }

  win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          ${collectStyles()}
          @media print {
            @page { margin: 15mm; size: A4 portrait; }

            body  { -webkit-print-color-adjust: exact; print-color-adjust: exact; }

            /* Repeat table headers on every page */
            thead { display: table-header-group; }
            tfoot { display: table-footer-group; }

            /* Prevent table rows from splitting across a page break */
            tr, td, th { page-break-inside: avoid; }

            /*
             * Strip InvoicePreview card chrome for cleaner multi-page output.
             * The outer div (id="invoice-preview-print") wraps the component root;
             * its direct child is the rounded card — we reset it to a plain block.
             */
            #invoice-preview-print > div {
              border-radius: 0 !important;
              box-shadow:    none !important;
              border:        none !important;
              padding:       0    !important;
            }
          }
        </style>
      </head>
      <body style="margin:0;padding:24px;background:white;font-family:Inter,sans-serif;">
        ${element.outerHTML}
      </body>
    </html>
  `);

  win.document.close();
  win.focus();

  // Allow injected styles and any async fonts to render before the dialog opens.
  // TypeScript maintains the Window narrowing for const win inside this closure.
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

/**
 * Collects all CSS rules from the current page into a single string.
 *
 * - Inline/injected <style> sheets (Vite dev mode, compiled bundles): rules
 *   are read directly via cssRules.
 * - Cross-origin linked sheets: cannot be read via cssRules; fall back to an
 *   @import rule so the print window can fetch them independently.
 */
function collectStyles(): string {
  return Array.from(document.styleSheets)
    .flatMap((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText);
      } catch {
        // SecurityError: cross-origin sheet — link via @import
        return sheet.href ? [`@import url("${sheet.href}");`] : [];
      }
    })
    .join("\n");
}

/**
 * Minimal HTML escaping so invoice numbers / titles are safe inside
 * the <title> attribute of the generated print document.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Opens the browser's native print dialog for the element identified by
 * `elementId`. The element must wrap an `<InvoicePreview />` in the live DOM.
 *
 * Usage:
 *   // In JSX:
 *   <div id="invoice-preview-print"><InvoicePreview ... /></div>
 *
 *   // In handler:
 *   printInvoice("invoice-preview-print");
 *
 * @param elementId  id of the wrapper element around InvoicePreview
 * @param title      Document title for the print window (default: "Invoice")
 */
export function printInvoice(elementId: string, title = "Invoice"): void {
  const el = document.getElementById(elementId);

  if (!el) {
    console.warn(`[printInvoice] Element #${elementId} not found in the DOM.`);
    return;
  }

  openPrintWindow(el, title);
}
