import { useMemo } from "react";
import PageHeader from "../../../components/common/PageHeader";
import useClients from "../../../hooks/useClients";
import useInvoices from "../../../hooks/useInvoices";
import useProposals from "../../../hooks/useProposals";
import useExpenses from "../../../hooks/useExpenses";
import useProjects from "../../../hooks/useProjects";
import { TrendingUp, Users, FileCheck, DollarSign, Clock, ArrowUpRight } from "lucide-react";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export default function InsightsPage() {
  const { clients } = useClients();
  const { invoices } = useInvoices();
  const { proposals } = useProposals();
  const { expenses } = useExpenses();
  const { projects } = useProjects();

  const insights = useMemo(() => {
    // Basic revenue metrics
    const paidInvoices = invoices.filter((i) => i.status === "paid");
    const totalRevenue = paidInvoices.reduce((sum, i) => sum + calculateInvoice(i.lineItems, i.discountRate, i.taxRate).total, 0);
    const avgInvoiceValue = paidInvoices.length > 0 ? totalRevenue / paidInvoices.length : 0;

    // Payment delay (days between issue and due)
    let totalDelayDays = 0;
    let delayCount = 0;
    paidInvoices.forEach(inv => {
      const issue = new Date(inv.issueDate).getTime();
      const due = new Date(inv.dueDate).getTime();
      // simplified proxy for delay if paid date isn't stored, assuming paid by due date
      const days = (due - issue) / (1000 * 60 * 60 * 24);
      if (days >= 0) {
        totalDelayDays += days;
        delayCount++;
      }
    });
    const avgPaymentDelay = delayCount > 0 ? totalDelayDays / delayCount : 0;

    // Proposal conversion
    const totalProposals = proposals.length;
    const acceptedProposals = proposals.filter((p) => p.status === "accepted").length;
    const conversionRate = totalProposals > 0 ? (acceptedProposals / totalProposals) * 100 : 0;

    // Repeat clients
    const clientsWithMultipleProjects = clients.filter(c => {
      const clientProjects = projects.filter(p => p.client_id === c.id);
      return clientProjects.length > 1;
    }).length;
    const repeatClientRate = clients.length > 0 ? (clientsWithMultipleProjects / clients.length) * 100 : 0;

    // Top clients by revenue
    const clientRevenue: Record<string, number> = {};
    paidInvoices.forEach(inv => {
      clientRevenue[inv.clientId] = (clientRevenue[inv.clientId] || 0) + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total;
    });
    const topClients = clients
      .map(c => ({ ...c, revenue: clientRevenue[c.id] || 0 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Most profitable projects
    const projectProfit: Record<string, number> = {};
    paidInvoices.forEach(inv => {
      if (inv.projectId) {
        projectProfit[inv.projectId] = (projectProfit[inv.projectId] || 0) + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total;
      }
    });
    expenses.forEach(exp => {
      if (exp.project_id) {
        projectProfit[exp.project_id] = (projectProfit[exp.project_id] || 0) - exp.amount;
      }
    });
    
    const topProjects = projects
      .map(p => ({ ...p, profit: projectProfit[p.id] || 0 }))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 5);

    return {
      totalRevenue,
      avgInvoiceValue,
      avgPaymentDelay,
      conversionRate,
      repeatClientRate,
      topClients,
      topProjects,
    };
  }, [clients, invoices, proposals, expenses, projects]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Insights"
        description="Key metrics and trends to help you grow your business."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 text-emerald-600 mb-2">
            <DollarSign size={20} />
            <h3 className="font-medium">Avg Invoice Value</h3>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(insights.avgInvoiceValue)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 text-indigo-600 mb-2">
            <FileCheck size={20} />
            <h3 className="font-medium">Proposal Conversion</h3>
          </div>
          <p className="text-2xl font-bold">{insights.conversionRate.toFixed(1)}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 text-blue-600 mb-2">
            <Users size={20} />
            <h3 className="font-medium">Repeat Client Rate</h3>
          </div>
          <p className="text-2xl font-bold">{insights.repeatClientRate.toFixed(1)}%</p>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex items-center gap-3 text-amber-600 mb-2">
            <Clock size={20} />
            <h3 className="font-medium">Avg Payment Terms</h3>
          </div>
          <p className="text-2xl font-bold">{insights.avgPaymentDelay.toFixed(0)} days</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white rounded-xl border shadow-sm flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Top Clients by Revenue</h3>
              <p className="text-sm text-gray-500">Your most valuable relationships</p>
            </div>
            <TrendingUp className="text-gray-400" />
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-4">
              {insights.topClients.map((client, i) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-medium text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.company || "Individual"}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">{formatCurrency(client.revenue)}</p>
                </div>
              ))}
              {insights.topClients.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No revenue data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Most Profitable Projects */}
        <div className="bg-white rounded-xl border shadow-sm flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Most Profitable Projects</h3>
              <p className="text-sm text-gray-500">Revenue minus expenses</p>
            </div>
            <ArrowUpRight className="text-gray-400" />
          </div>
          <div className="flex-1 p-6">
            <div className="space-y-4">
              {insights.topProjects.map((project, i) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-medium text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">Profit Margin</p>
                    </div>
                  </div>
                  <p className="font-semibold text-emerald-600">+{formatCurrency(project.profit)}</p>
                </div>
              ))}
              {insights.topProjects.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No project profitability data yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
