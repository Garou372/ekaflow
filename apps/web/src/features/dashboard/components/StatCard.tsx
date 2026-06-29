import { type ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

type StatCardColor = "indigo" | "emerald" | "amber" | "red" | "purple" | "blue";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  /** Visual accent color — defaults to "indigo" */
  color?: StatCardColor;
};

// ─── Color Map ────────────────────────────────────────────────────

const COLOR_MAP: Record<
  StatCardColor,
  { icon: string; iconBg: string; gradient: string }
> = {
  indigo: {
    icon:     "text-indigo-600",
    iconBg:   "bg-indigo-50",
    gradient: "from-indigo-500 to-violet-500",
  },
  emerald: {
    icon:     "text-emerald-600",
    iconBg:   "bg-emerald-50",
    gradient: "from-emerald-400 to-teal-500",
  },
  amber: {
    icon:     "text-amber-600",
    iconBg:   "bg-amber-50",
    gradient: "from-amber-400 to-orange-500",
  },
  red: {
    icon:     "text-red-500",
    iconBg:   "bg-red-50",
    gradient: "from-red-400 to-rose-500",
  },
  purple: {
    icon:     "text-purple-600",
    iconBg:   "bg-purple-50",
    gradient: "from-purple-500 to-indigo-500",
  },
  blue: {
    icon:     "text-blue-600",
    iconBg:   "bg-blue-50",
    gradient: "from-blue-400 to-cyan-500",
  },
};

// ─── Component ────────────────────────────────────────────────────

export default function StatCard({
  title,
  value,
  icon,
  trend,
  trendUp,
  color = "indigo",
}: StatCardProps) {
  const c = COLOR_MAP[color];

  // Determine trend indicator
  const TrendIcon =
    trendUp === undefined
      ? Minus
      : trendUp
        ? TrendingUp
        : TrendingDown;

  const trendColor =
    trendUp === undefined
      ? "text-gray-400"
      : trendUp
        ? "text-emerald-600"
        : "text-red-500";

  return (
    <div
      className="ek-card ek-card-hover p-6 relative overflow-hidden group"
      style={{ cursor: "default" }}
    >
      {/* Subtle gradient accent — top-right corner */}
      <div
        className={`absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-0 group-hover:opacity-100 bg-gradient-to-br ${c.gradient} blur-2xl transition-opacity duration-500`}
        aria-hidden="true"
      />

      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <p
          className="text-sm font-medium leading-tight"
          style={{ color: "var(--ek-text-secondary)" }}
        >
          {title}
        </p>

        {/* Icon container */}
        <div
          className={`p-2.5 rounded-xl ${c.iconBg} ${c.icon} transition-transform duration-200 group-hover:scale-110 shrink-0`}
        >
          {icon}
        </div>
      </div>

      {/* Value */}
      <div
        className="text-2xl font-bold tracking-tight mb-2"
        style={{ color: "var(--ek-text-primary)", fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </div>

      {/* Trend */}
      {trend && (
        <div className={`flex items-center gap-1.5 text-xs font-semibold ${trendColor}`}>
          <TrendIcon size={13} strokeWidth={2.5} />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
