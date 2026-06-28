import type { InvoiceWithRelations } from "../../invoices/types/invoice";
import type { Proposal } from "../../../services/proposal.service";
import type { Client } from "../../../services/client.service";

export type MonthlyRevenue = {
  month: string;
  total: number;
};

export function calculateDashboardMetrics(
  invoices: InvoiceWithRelations[],
  proposals: Proposal[],
  clients: Client[],
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

  return {
    totalRevenue,
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

export function getMonthlyRevenue(
  invoices: InvoiceWithRelations[],
): MonthlyRevenue[] {
  // Aggregate revenue for the last 6 months
  const monthsMap = new Map<string, number>();

  const today = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthKey = d.toLocaleString("default", { month: "short" });
    monthsMap.set(monthKey, 0);
  }

  for (const invoice of invoices) {
    if (invoice.status === "paid" && invoice.issueDate) {
      const d = new Date(invoice.issueDate);
      const monthKey = d.toLocaleString("default", { month: "short" });
      
      if (monthsMap.has(monthKey)) {
        monthsMap.set(
          monthKey,
          monthsMap.get(monthKey)! + invoice.totals.total,
        );
      }
    }
  }

  return Array.from(monthsMap.entries()).map(([month, total]) => ({
    month,
    total,
  }));
}
