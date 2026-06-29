import { useState } from "react";
import { Check, Zap, Building2, Crown, AlertCircle } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import { useSubscription } from "../../../hooks/useSubscription";
import { useUsage } from "../../../hooks/useUsage";
import { PLAN_LIMITS, type SubscriptionPlan } from "../../../services/subscription.service";

const PLAN_ICONS: Record<SubscriptionPlan, React.ReactNode> = {
  starter: <Zap size={24} className="text-blue-500" />,
  professional: <Building2 size={24} className="text-indigo-500" />,
  business: <Crown size={24} className="text-purple-500" />,
};

const PLAN_COLORS: Record<SubscriptionPlan, string> = {
  starter: "border-blue-200 bg-blue-50",
  professional: "border-indigo-200 bg-indigo-50",
  business: "border-purple-200 bg-purple-50",
};

const PLAN_BUTTON_COLORS: Record<SubscriptionPlan, string> = {
  starter: "bg-blue-600 hover:bg-blue-700",
  professional: "bg-indigo-600 hover:bg-indigo-700",
  business: "bg-purple-600 hover:bg-purple-700",
};

const formatBytes = (bytes: number) => {
  if (bytes === -1) return "Unlimited";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb}GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb}MB`;
};

const formatLimit = (n: number, unit = "") =>
  n === -1 ? `Unlimited${unit}` : `${n}${unit}`;

export default function BillingPage() {
  const { subscription, isLoading: isSubLoading, isTrialing, daysLeftInTrial, upgradePlan, upgrading } =
    useSubscription();
  const { data: usageMetrics, isLoading: isUsageLoading } = useUsage();
  const [confirmPlan, setConfirmPlan] = useState<SubscriptionPlan | null>(null);

  const isLoading = isSubLoading || isUsageLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Billing & Plans" description="Manage your subscription and usage." />
        <div className="grid gap-5 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="ek-skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const currentPlan = subscription?.plan ?? "starter";

  const handleUpgrade = async (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    setConfirmPlan(null);
    await upgradePlan(plan);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing & Plans"
        description="Manage your subscription, usage, and billing history."
      />

      {/* Trial Banner */}
      {isTrialing && (
        <div
          className="flex items-center gap-3 px-5 py-4 rounded-2xl"
          style={{
            background: "#FFFBEB",
            border: "1.5px solid #FDE68A",
          }}
        >
          <AlertCircle size={20} style={{ color: "#D97706", flexShrink: 0 }} />
          <div>
            <p className="font-bold" style={{ color: "#92400E", fontSize: 14 }}>
              {daysLeftInTrial} day{daysLeftInTrial !== 1 ? "s" : ""} left in your free trial
            </p>
            <p className="text-sm text-amber-700">
              Upgrade now to keep access to all features. No automatic charge — you choose when to upgrade.
            </p>
          </div>
        </div>
      )}

      {/* Current Plan Status */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <h2 className="mt-1 text-2xl font-bold text-gray-900">
              {PLAN_LIMITS[currentPlan].name}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Status:{" "}
              <span
                className={`font-medium ${
                  subscription?.status === "active"
                    ? "text-emerald-600"
                    : subscription?.status === "trialing"
                      ? "text-amber-600"
                      : "text-red-600"
                }`}
              >
                {subscription?.status?.replace("_", " ") ?? "Unknown"}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">
              ₹{PLAN_LIMITS[currentPlan].price_monthly}
            </p>
            <p className="text-sm text-gray-500">/month</p>
          </div>
        </div>
      </div>

      {/* Plan Cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {(["starter", "professional", "business"] as SubscriptionPlan[]).map((plan) => {
          const limits = PLAN_LIMITS[plan];
          const isCurrent = plan === currentPlan;
          const isDowngrade =
            (currentPlan === "business" && plan !== "business") ||
            (currentPlan === "professional" && plan === "starter");

          return (
            <div
              key={plan}
              className={`relative rounded-xl border-2 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                isCurrent ? PLAN_COLORS[plan] : "border-gray-200"
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                  Current Plan
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                {PLAN_ICONS[plan]}
                <div>
                  <h3 className="font-semibold text-gray-900">{limits.name}</h3>
                  <p className="text-sm text-gray-500">{limits.description}</p>
                </div>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{limits.price_monthly}</span>
                <span className="text-sm text-gray-500">/month</span>
              </div>

              <ul className="space-y-2 mb-6">
                {[
                  `${formatLimit(limits.clients)} clients`,
                  `${formatLimit(limits.projects)} projects`,
                  `${formatLimit(limits.invoices_per_month)} invoices/month`,
                  `${formatLimit(limits.proposals_per_month)} proposals/month`,
                  `${formatLimit(limits.ai_queries_per_month)} AI queries/month`,
                  `${formatBytes(limits.storage_bytes)} storage`,
                  `${formatLimit(limits.team_members)} team member${limits.team_members === 1 ? "" : "s"}`,
                  limits.client_portal ? "Client Portal" : null,
                  limits.automation ? "Automation" : null,
                  limits.advanced_reports ? "Advanced Reports" : null,
                ]
                  .filter(Boolean)
                  .map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
              </ul>

              {!isCurrent && (
                <button
                  onClick={() => setConfirmPlan(plan)}
                  disabled={upgrading}
                  className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 ${PLAN_BUTTON_COLORS[plan]}`}
                >
                  {isDowngrade ? "Downgrade" : "Upgrade"} to {limits.name}
                </button>
              )}

              {isCurrent && (
                <div className="rounded-lg bg-gray-100 px-4 py-2.5 text-center text-sm font-medium text-gray-600">
                  Active Plan
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Usage Meters */}
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { key: 'invoice_created', label: 'Invoices', limit: PLAN_LIMITS[currentPlan].invoices_per_month },
            { key: 'client_created', label: 'Clients', limit: PLAN_LIMITS[currentPlan].clients },
            { key: 'proposal_created', label: 'Proposals', limit: PLAN_LIMITS[currentPlan].proposals_per_month },
            { key: 'ai_query', label: 'AI Queries', limit: PLAN_LIMITS[currentPlan].ai_queries_per_month }
          ].map(({ key, label, limit }) => {
            const used = usageMetrics?.find((m) => m.metric_type === key)?.count || 0;
            const percent = limit === -1 ? 0 : Math.min((used / limit) * 100, 100);
            
            return (
              <div key={key}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{label}</span>
                  <span className="text-gray-500">
                    {used} / {limit === -1 ? 'Unlimited' : limit}
                  </span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${percent > 90 ? 'bg-red-500' : percent > 75 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                    style={{ width: `${limit === -1 ? 0 : percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmPlan && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={() => setConfirmPlan(null)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Plan Change
            </h3>
            <p className="mt-2 text-gray-600">
              You're switching to the{" "}
              <strong>{PLAN_LIMITS[confirmPlan].name}</strong> plan at{" "}
              <strong>₹{PLAN_LIMITS[confirmPlan].price_monthly}/month</strong>.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              In production, this would initiate a Razorpay payment flow. For now, the plan will be updated directly.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmPlan(null)}
                className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpgrade(confirmPlan)}
                disabled={upgrading}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {upgrading ? "Confirming..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
