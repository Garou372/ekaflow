import type { InvoiceWithRelations } from "../../invoices/types/invoice";
import type { Proposal } from "../../../services/proposal.service";
import type { Client } from "../../../services/client.service";
import type { Expense } from "../../expenses/types/expense";

export type MonthlyMetric = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
};

export function calculateDashboardMetrics(
  invoices: InvoiceWithRelations[],
  proposals: Proposal[],
  clients: Client[],
  expenses: Expense[] = [],
) {
  let totalRevenue = 0;
  let outstanding = 0;
  let overdue = 0;
  let draftPipeline = 0;

  for (const invoice of invoices) {
    const amount = invoice.totals.total;

    if (invoice.status === "paid") {
      totalRevenue += amount;
    } else if (invoice.status === "sent") {
      outstanding += amount;
    } else if (invoice.status === "overdue") {
      overdue += amount;
    } else if (invoice.status === "draft") {
      draftPipeline += amount;
    }
  }

  const activeClients = clients.length;

  const openProposals = proposals.filter((p) => p.status === "sent").length;
  const acceptedProposals = proposals.filter(
    (p) => p.status === "accepted",
  ).length;
  const rejectedProposals = proposals.filter(
    (p) => p.status === "rejected",
  ).length;

  const winRate =
    acceptedProposals + rejectedProposals > 0
      ? (acceptedProposals / (acceptedProposals + rejectedProposals)) * 100
      : 0;

  const invoicesWithProposals = invoices.filter((i) => i.proposalId).length;
  const proposalToInvoiceRate =
    invoices.length > 0 ? (invoicesWithProposals / invoices.length) * 100 : 0;

  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    outstanding,
    overdue,
    draftPipeline,
    activeClients,
    openProposals,
    acceptedProposals,
    winRate,
    proposalToInvoiceRate,
  };
}

export function getMonthlyMetrics(
  invoices: InvoiceWithRelations[],
  expenses: Expense[] = [],
): MonthlyMetric[] {
  // Aggregate revenue and expenses for the last 6 months
  const monthsMap = new Map<string, { revenue: number; expenses: number }>();

  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = d.toLocaleString("default", { month: "short" });
    monthsMap.set(monthKey, { revenue: 0, expenses: 0 });
  }

  for (const invoice of invoices) {
    if (invoice.status === "paid" && invoice.issueDate) {
      const d = new Date(invoice.issueDate);
      const monthKey = d.toLocaleString("default", { month: "short" });
      
      if (monthsMap.has(monthKey)) {
        const curr = monthsMap.get(monthKey)!;
        monthsMap.set(monthKey, {
          ...curr,
          revenue: curr.revenue + invoice.totals.total,
        });
      }
    }
  }

  for (const expense of expenses) {
    if (expense.date) {
      const d = new Date(expense.date);
      const monthKey = d.toLocaleString("default", { month: "short" });
      
      if (monthsMap.has(monthKey)) {
        const curr = monthsMap.get(monthKey)!;
        monthsMap.set(monthKey, {
          ...curr,
          expenses: curr.expenses + expense.amount,
        });
      }
    }
  }

  return Array.from(monthsMap.entries()).map(([month, data]) => ({
    month,
    revenue: data.revenue,
    expenses: data.expenses,
    profit: data.revenue - data.expenses,
  }));
}
