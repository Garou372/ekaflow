import { Link } from "react-router-dom";
import type { InvoiceWithRelations } from "../../invoices/types/invoice";
import { formatCurrency } from "../../invoices/utils/currency";

type OverdueListProps = {
  invoices: InvoiceWithRelations[];
};

export default function OverdueList({ invoices }: OverdueListProps) {
  const overdueInvoices = invoices
    .filter((inv) => inv.status === "overdue")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Overdue Invoices</h3>
        <Link to="/invoices" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View all
        </Link>
      </div>

      {overdueInvoices.length === 0 ? (
        <div className="rounded-lg border border-dashed py-8 text-center text-sm text-gray-500">
          No overdue invoices 🎉
        </div>
      ) : (
        <div className="space-y-4">
          {overdueInvoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-gray-50">
              <div>
                <p className="font-medium text-gray-900">{invoice.clientName}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>{invoice.invoiceNumber}</span>
                  <span>•</span>
                  <span className="text-red-600">Due: {invoice.dueDate}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-gray-900">{formatCurrency(invoice.totals.total)}</p>
                <Link
                  to="/invoices"
                  className="mt-1 inline-block text-xs font-medium text-indigo-600 hover:text-indigo-700"
                >
                  Mark Paid &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
