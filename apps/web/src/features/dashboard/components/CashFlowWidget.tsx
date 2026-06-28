import { ArrowRight, Wallet, Calendar } from "lucide-react";
import type { CashFlowSummary } from "../utils/cashflow";
import { formatCurrency } from "../../invoices/utils/currency";

export default function CashFlowWidget({ summary }: { summary: CashFlowSummary }) {
  if (summary.periods.length === 0) return null;

  // Let's just show the next 3 months for the widget
  const upcomingPeriods = summary.periods.slice(0, 3);

  return (
    <div className="rounded-xl border bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="border-b p-4 flex items-center justify-between bg-gray-50/50">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Wallet size={16} className="text-indigo-600" />
          Cash Flow Forecast
        </h3>
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Next 3 Months</span>
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Expected Net</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.netForecast)}
            </p>
          </div>
          {summary.nextPaymentDue && (
            <div className="text-right">
              <p className="text-sm text-gray-500">Next Due</p>
              <p className="text-sm font-semibold text-gray-900 flex items-center justify-end gap-1">
                <Calendar size={14} className="text-amber-500" />
                {new Date(summary.nextPaymentDue.date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(summary.nextPaymentDue.amount)}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 mt-4">
          {upcomingPeriods.map((period) => {
            const isPositive = period.netForecast >= 0;
            return (
              <div key={period.label} className="flex items-center justify-between border-t pt-3">
                <span className="text-sm font-medium text-gray-700">{period.label}</span>
                <div className="flex gap-4 text-right">
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">+{formatCurrency(period.expectedIncome, { minimumFractionDigits: 0 })}</p>
                    <p className="text-xs text-red-500 mt-0.5">-{formatCurrency(period.expectedExpenses, { minimumFractionDigits: 0 })}</p>
                  </div>
                  <div className="w-20">
                    <p className={`text-sm font-bold ${isPositive ? "text-emerald-600" : "text-red-600"}`}>
                      {formatCurrency(period.netForecast, { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 border-t text-center">
        <button className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 w-full">
          View Full Forecast <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
