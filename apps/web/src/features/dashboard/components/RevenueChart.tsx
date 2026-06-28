import type { MonthlyMetric } from "../utils/metrics";
import { formatCurrency } from "../../invoices/utils/currency";

type RevenueChartProps = {
  data: MonthlyMetric[];
};

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-gray-500">No revenue data available.</p>
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  // Provide a minimum scale so small amounts don't fill the whole height
  const scaleMax = maxRevenue > 0 ? maxRevenue * 1.1 : 100;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-semibold">Profit & Loss (Last 6 Months)</h3>

      <div className="relative h-64 w-full">
        {/* Y-axis labels */}
        <div className="absolute inset-y-0 left-0 flex flex-col justify-between pb-8 text-xs text-gray-400">
          <span>{formatCurrency(scaleMax, { minimumFractionDigits: 0 })}</span>
          <span>{formatCurrency(scaleMax / 2, { minimumFractionDigits: 0 })}</span>
          <span>{formatCurrency(0, { minimumFractionDigits: 0 })}</span>
        </div>

        {/* Grid lines */}
        <div className="absolute inset-y-0 left-16 right-0 flex flex-col justify-between pb-8">
          <div className="w-full border-t border-dashed border-gray-200"></div>
          <div className="w-full border-t border-dashed border-gray-200"></div>
          <div className="w-full border-t border-dashed border-gray-200"></div>
        </div>

        {/* Chart Bars */}
        <div className="absolute inset-y-0 left-16 right-0 flex items-end justify-between pb-8">
          {data.map((d) => {
            const revHeight = (d.revenue / scaleMax) * 100;
            const expHeight = (d.expenses / scaleMax) * 100;
            return (
              <div key={d.month} className="group relative flex w-1/6 justify-center items-end gap-1">
                <div
                  className="w-4 sm:w-6 rounded-t-sm bg-indigo-500 transition-all duration-300 group-hover:bg-indigo-600"
                  style={{ height: `${Math.max(revHeight, 2)}%` }}
                ></div>
                <div
                  className="w-4 sm:w-6 rounded-t-sm bg-red-400 transition-all duration-300 group-hover:bg-red-500"
                  style={{ height: `${Math.max(expHeight, 2)}%` }}
                ></div>
                
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-16 hidden rounded bg-gray-900 px-3 py-2 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 z-10 w-max text-left shadow-lg">
                  <div className="text-gray-300 mb-1 font-semibold border-b border-gray-700 pb-1">{d.month}</div>
                  <div>Rev: <span className="text-indigo-300">{formatCurrency(d.revenue)}</span></div>
                  <div>Exp: <span className="text-red-300">{formatCurrency(d.expenses)}</span></div>
                  <div className="mt-1 pt-1 font-bold">
                    Profit: <span className={d.profit >= 0 ? "text-emerald-400" : "text-red-400"}>{formatCurrency(d.profit)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute bottom-0 left-16 right-0 flex justify-between border-t pt-3 text-xs text-gray-500">
          {data.map((d) => (
            <div key={d.month} className="w-1/6 text-center">
              {d.month}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
