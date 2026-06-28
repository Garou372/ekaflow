import { useMemo, useState } from "react";
import useRecurringInvoices from "../../../hooks/useRecurringInvoices";
import useClients from "../../../hooks/useClients";
import useInvoices from "../../../hooks/useInvoices";
import { Play, Pause, RefreshCw } from "lucide-react";
import { formatCurrency } from "../../invoices/utils/currency";
import { getNextInvoiceNumber } from "../../invoices/utils/invoiceNumber";
import type { CreateInvoiceInput } from "../../invoices/types/invoice";

export default function RecurringInvoicesList() {
  const { recurringInvoices, isLoading, updateStatus, processRecurring } = useRecurringInvoices();
  const { clients } = useClients();
  const { invoices, createInvoice } = useInvoices();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const enriched = useMemo(() => {
    return recurringInvoices.map((ri) => {
      const client = clients.find((c) => c.id === ri.client_id);
      
      const subtotal = ri.template_data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      const taxAmount = subtotal * (ri.template_data.taxRate / 100);
      const discountAmount = subtotal * (ri.template_data.discountRate / 100);
      const total = subtotal + taxAmount - discountAmount;

      const isDue = new Date(ri.next_run_date) <= new Date() && ri.status === "active";

      return {
        ...ri,
        clientName: client?.name ?? "Unknown Client",
        total,
        isDue,
      };
    });
  }, [recurringInvoices, clients]);

  const nextInvoiceNumber = useMemo(
    () => getNextInvoiceNumber(invoices[0]?.invoiceNumber),
    [invoices],
  );

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    await updateStatus({ id, status: currentStatus === "active" ? "paused" : "active" });
  };

  const handleProcessDue = async (ri: typeof enriched[0]) => {
    setIsProcessing(ri.id);
    try {
      // 1. Generate the actual invoice
      const newInvoice: CreateInvoiceInput = {
        clientId: ri.client_id,
        projectId: ri.project_id,
        proposalId: null,
        invoiceNumber: nextInvoiceNumber, // Note: if processing multiple at once, this logic needs to iterate the number. Since it's one by one manual click, it's ok.
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        status: "draft",
        lineItems: ri.template_data.items,
        taxRate: ri.template_data.taxRate,
        discountRate: ri.template_data.discountRate,
        notes: ri.template_data.notes ?? null,
      };

      await createInvoice(newInvoice);

      // 2. Calculate next run date
      const current = new Date(ri.next_run_date);
      let nextDate = new Date(current);
      if (ri.frequency === "weekly") {
        nextDate.setDate(nextDate.getDate() + 7);
      } else if (ri.frequency === "monthly") {
        nextDate.setMonth(nextDate.getMonth() + 1);
      } else if (ri.frequency === "yearly") {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }

      await processRecurring({
        id: ri.id,
        currentRunDate: new Date().toISOString().split("T")[0],
        newNextRunDate: nextDate.toISOString().split("T")[0],
      });
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return <div className="py-10 text-center text-gray-500">Loading recurring templates...</div>;
  }

  if (enriched.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center bg-white">
        <h3 className="text-xl font-semibold">No Recurring Invoices</h3>
        <p className="mt-2 text-gray-500">
          To create one, click "New Invoice" and toggle "Make Recurring".
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {enriched.map((ri) => (
          <div key={ri.id} className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{ri.clientName}</h3>
                <p className="text-xs text-gray-500 capitalize">{ri.frequency} • {formatCurrency(ri.total)}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                ri.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
              }`}>
                {ri.status}
              </span>
            </div>
            
            <div className="p-5 flex-1 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Next Run</span>
                <span className={`font-medium ${ri.isDue ? 'text-red-600' : 'text-gray-900'}`}>
                  {ri.next_run_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Run</span>
                <span className="text-gray-900">{ri.last_run_date || 'Never'}</span>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex gap-2">
              <button
                onClick={() => handleToggleStatus(ri.id, ri.status)}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
              >
                {ri.status === "active" ? <><Pause size={16} /> Pause</> : <><Play size={16} /> Resume</>}
              </button>
              
              <button
                onClick={() => handleProcessDue(ri)}
                disabled={!ri.isDue || isProcessing === ri.id}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                title={ri.isDue ? "Generate invoice now" : "Not due yet"}
              >
                <RefreshCw size={16} className={isProcessing === ri.id ? "animate-spin" : ""} />
                {isProcessing === ri.id ? "Running..." : ri.isDue ? "Run Now" : "Not Due"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
