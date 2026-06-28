import type { Expense } from "../../expenses/types/expense";
import type { RecurringInvoice } from "../../invoices/types/recurring";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";
import type { Invoice } from "../../invoices/types/invoice";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CashFlowPeriod {
  label: string;       // "Jul 2026"
  startDate: Date;
  endDate: Date;
  expectedIncome: number;
  expectedExpenses: number;
  netForecast: number;
  confirmedIncome: number; // paid invoices in period
  pendingIncome: number;   // outstanding invoices in period
  overdueIncome: number;
}

export interface CashFlowSummary {
  periods: CashFlowPeriod[];
  totalExpected: number;
  totalExpenses: number;
  netForecast: number;
  nextPaymentDue: { date: string; amount: number; label: string } | null;
}

// ─── Core forecast logic ──────────────────────────────────────────────────────

export function buildCashFlowForecast(
  invoices: Invoice[],
  expenses: Expense[],
  recurringInvoices: RecurringInvoice[],
  months = 6,
): CashFlowSummary {
  const today = new Date();
  const periods: CashFlowPeriod[] = [];

  // Build month buckets
  for (let i = 0; i < months; i++) {
    const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const startDate = new Date(d.getFullYear(), d.getMonth(), 1);
    const endDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    endDate.setHours(23, 59, 59);

    const label = d.toLocaleString("en-IN", { month: "short", year: "numeric" });
    periods.push({
      label,
      startDate,
      endDate,
      expectedIncome: 0,
      expectedExpenses: 0,
      netForecast: 0,
      confirmedIncome: 0,
      pendingIncome: 0,
      overdueIncome: 0,
    });
  }

  // Populate income from invoices (by due date)
  for (const inv of invoices) {
    if (["cancelled"].includes(inv.status)) continue;

    const dueDate = new Date(inv.dueDate);
    for (const period of periods) {
      if (dueDate >= period.startDate && dueDate <= period.endDate) {
        const total = calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total;
        if (inv.status === "paid") {
          period.confirmedIncome += total;
          period.expectedIncome += total;
        } else if (inv.status === "sent") {
          period.pendingIncome += total;
          period.expectedIncome += total;
        } else if (inv.status === "overdue") {
          period.overdueIncome += total;
          period.expectedIncome += total;
        }
        break;
      }
    }
  }

  // Populate income from active recurring invoices (project next run date)
  for (const rec of recurringInvoices) {
    if (rec.status !== "active") continue;
    const nextRun = new Date(rec.next_run_date);
    for (const period of periods) {
      if (nextRun >= period.startDate && nextRun <= period.endDate) {
        const amount = calculateInvoice(rec.template_data.items, rec.template_data.discountRate, rec.template_data.taxRate).total;
        period.expectedIncome += amount;
        period.pendingIncome += amount;
        break;
      }
    }
  }

  // Populate expenses (by date)
  for (const exp of expenses) {
    const expDate = new Date(exp.date);
    for (const period of periods) {
      if (expDate >= period.startDate && expDate <= period.endDate) {
        period.expectedExpenses += exp.amount;
        break;
      }
    }
  }

  // Calculate net forecast for each period
  for (const period of periods) {
    period.netForecast = period.expectedIncome - period.expectedExpenses;
  }

  // Find next payment due
  const pendingInvoices = invoices
    .filter((inv) => ["sent", "overdue"].includes(inv.status))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const nextPaymentDue = pendingInvoices[0]
    ? {
        date: pendingInvoices[0].dueDate,
        amount: calculateInvoice(pendingInvoices[0].lineItems, pendingInvoices[0].discountRate, pendingInvoices[0].taxRate).total,
        label: `${pendingInvoices[0].invoiceNumber}`,
      }
    : null;

  return {
    periods,
    totalExpected: periods.reduce((s, p) => s + p.expectedIncome, 0),
    totalExpenses: periods.reduce((s, p) => s + p.expectedExpenses, 0),
    netForecast: periods.reduce((s, p) => s + p.netForecast, 0),
    nextPaymentDue,
  };
}
