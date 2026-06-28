import type { MonthlyRevenue } from "../utils/metrics";
import { formatCurrency } from "../../invoices/utils/currency";

type RevenueChartProps = {
  data: MonthlyRevenue[];
};

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border bg-white p-6 shadow-sm">
        <p className="text-gray-500">No revenue data available.</p>
      </div>
    );
  }

  const maxTotal = Math.max(...data.map((d) => d.total));
  // Provide a minimum scale so small amounts don't fill the whole height
  const scaleMax = maxTotal > 0 ? maxTotal * 1.1 : 100;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h3 className="mb-6 font-semibold">Revenue (Last 6 Months)</h3>

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
            const heightPercent = (d.total / scaleMax) * 100;
            return (
              <div key={d.month} className="group relative flex w-1/6 justify-center">
                <div
                  className="w-12 rounded-t-sm bg-indigo-500 transition-all duration-300 group-hover:bg-indigo-600"
                  style={{ height: `${Math.max(heightPercent, 2)}%` }}
                ></div>
                
                {/* Tooltip */}
                <div className="pointer-events-none absolute -top-10 hidden rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                  {formatCurrency(d.total)}
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
