import { useMemo } from "react";
import { DollarSign, Clock, AlertCircle, Users } from "lucide-react";

import PageHeader from "../../../components/common/PageHeader";
import StatCard from "../components/StatCard";
import RevenueChart from "../components/RevenueChart";
import OverdueList from "../components/OverdueList";
import RecentActivity from "../components/RecentActivity";

import useInvoices from "../../../hooks/useInvoices";
import useProposals from "../../../hooks/useProposals";
import useClients from "../../../hooks/useClients";

import { calculateDashboardMetrics, getMonthlyRevenue } from "../utils/metrics";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";
import type { InvoiceWithRelations } from "../../invoices/types/invoice";
import { formatCurrency } from "../../invoices/utils/currency";

export default function DashboardPage() {
  const { invoices, isLoading: loadingInvoices } = useInvoices();
  const { proposals, isLoading: loadingProposals } = useProposals();
  const { clients, isLoading: loadingClients } = useClients();

  const isLoading = loadingInvoices || loadingProposals || loadingClients;

  const enrichedInvoices = useMemo((): InvoiceWithRelations[] => {
    return invoices.map((invoice) => ({
      ...invoice,
      clientName:
        clients.find((c) => c.id === invoice.clientId)?.name ??
        "Unknown Client",
      totals: calculateInvoice(
        invoice.lineItems,
        invoice.discountRate,
        invoice.taxRate,
      ),
    }));
  }, [invoices, clients]);

  const metrics = useMemo(() => {
    return calculateDashboardMetrics(enrichedInvoices, proposals, clients);
  }, [enrichedInvoices, proposals, clients]);

  const monthlyRevenue = useMemo(() => {
    return getMonthlyRevenue(enrichedInvoices);
  }, [enrichedInvoices]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of your business" />
        <div className="flex h-64 items-center justify-center">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Overview of your business" />

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(metrics.totalRevenue, { minimumFractionDigits: 0 })}
          icon={<DollarSign size={20} />}
          trend={`${Math.round(metrics.winRate)}% win rate`}
          trendUp={metrics.winRate >= 50}
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(metrics.outstanding, { minimumFractionDigits: 0 })}
          icon={<Clock size={20} />}
          trend={`${metrics.openProposals} open proposals`}
          trendUp={true}
        />
        <StatCard
          title="Overdue"
          value={formatCurrency(metrics.overdue, { minimumFractionDigits: 0 })}
          icon={<AlertCircle size={20} />}
          trend={metrics.overdue > 0 ? "Action required" : "All good"}
          trendUp={metrics.overdue === 0}
        />
        <StatCard
          title="Active Clients"
          value={metrics.activeClients}
          icon={<Users size={20} />}
          trend={`${Math.round(metrics.proposalToInvoiceRate)}% conversion`}
          trendUp={metrics.proposalToInvoiceRate >= 50}
        />
      </div>

      {/* Charts & Lists */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart data={monthlyRevenue} />
        </div>
        
        <div className="space-y-6">
          <OverdueList invoices={enrichedInvoices} />
          <RecentActivity invoices={enrichedInvoices} proposals={proposals} clients={clients} />
        </div>
      </div>
    </div>
  );
}
