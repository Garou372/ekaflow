import { useMemo, useState } from "react";
import { Target, Plus, Trash2, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import PageHeader from "../../../components/common/PageHeader";
import useGoals from "../../../hooks/useGoals";
import useInvoices from "../../../hooks/useInvoices";
import type { Goal, GoalType } from "../../../services/goals.service";
import { generatePeriodDates } from "../../../services/goals.service";
import { formatCurrency } from "../../invoices/utils/currency";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";

// ─── Goal Form ────────────────────────────────────────────────────────────────

type GoalFormState = {
  title: string;
  goal_type: GoalType;
  target_amount: string;
  period_start: string;
  period_end: string;
  notes: string;
};

function GoalForm({
  onSubmit,
  onClose,
  isSubmitting,
}: {
  onSubmit: (data: GoalFormState) => void;
  onClose: () => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<GoalFormState>(() => {
    const { start, end } = generatePeriodDates("monthly");
    return {
      title: "",
      goal_type: "monthly",
      target_amount: "",
      period_start: start,
      period_end: end,
      notes: "",
    };
  });

  function handleTypeChange(type: GoalType) {
    const { start, end } = generatePeriodDates(type);
    setForm((f) => ({
      ...f,
      goal_type: type,
      period_start: start,
      period_end: end,
    }));
  }

  return (
    <div className="ek-overlay" onClick={onClose}>
      <div className="ek-modal" style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--ek-border)" }}
        >
          <h2 className="font-bold" style={{ fontSize: 17, color: "var(--ek-text-primary)" }}>Set New Goal</h2>
          <button onClick={onClose} className="ek-btn-icon" aria-label="Close">✕</button>
        </div>
        <div className="space-y-4 p-6">
          <div>
            <label className="ek-label">Goal title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. ₹1L monthly revenue"
              className="ek-input mt-1"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Goal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {(["monthly", "quarterly", "yearly", "custom"] as GoalType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => handleTypeChange(t)}
                  className={`rounded-lg border px-2 py-1.5 text-xs font-medium capitalize transition-colors ${
                    form.goal_type === t
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="ek-label">Target amount (₹)</label>
            <input
              type="number"
              min="0"
              value={form.target_amount}
              onChange={(e) => setForm((f) => ({ ...f, target_amount: e.target.value }))}
              placeholder="100000"
              className="ek-input mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Start</label>
              <input
                type="date"
                value={form.period_start}
                onChange={(e) => setForm((f) => ({ ...f, period_start: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">End</label>
              <input
                type="date"
                value={form.period_end}
                onChange={(e) => setForm((f) => ({ ...f, period_end: e.target.value }))}
                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Notes (optional)</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              className="w-full rounded-lg border px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div
          className="flex justify-end gap-3 px-6 pb-6"
          style={{ borderTop: "1px solid var(--ek-border)", paddingTop: 16 }}
        >
          <button onClick={onClose} className="ek-btn ek-btn-secondary ek-btn-md">Cancel</button>
          <button
            disabled={isSubmitting || !form.title || !form.target_amount}
            onClick={() => onSubmit(form)}
            className="ek-btn ek-btn-primary ek-btn-md"
          >
            {isSubmitting ? "Saving…" : "Set Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({
  goal,
  earned,
  onDelete,
}: {
  goal: Goal;
  earned: number;
  onDelete: () => void;
}) {
  const progress = goal.target_amount > 0
    ? Math.min((earned / goal.target_amount) * 100, 100)
    : 0;
  const remaining = Math.max(goal.target_amount - earned, 0);
  const isComplete = earned >= goal.target_amount;

  // Forecast: days elapsed vs days remaining
  const start = new Date(goal.period_start);
  const end = new Date(goal.period_end);
  const today = new Date();
  const totalDays = Math.max((end.getTime() - start.getTime()) / 86400000, 1);
  const elapsedDays = Math.max((today.getTime() - start.getTime()) / 86400000, 0);
  const daysRemaining = Math.max((end.getTime() - today.getTime()) / 86400000, 0);
  const dailyRateNeeded = daysRemaining > 0 ? remaining / daysRemaining : 0;
  const currentDailyRate = elapsedDays > 0 ? earned / elapsedDays : 0;
  const forecastedTotal = currentDailyRate * totalDays;
  const isOnTrack = forecastedTotal >= goal.target_amount;
  const percentElapsed = Math.min((elapsedDays / totalDays) * 100, 100);

  return (
    <div
      className="ek-card ek-card-hover p-5"
      style={isComplete ? { borderColor: "#BBF7D0", background: "#F0FDF4" } : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isComplete ? (
            <CheckCircle size={17} style={{ color: "var(--ek-success)", flexShrink: 0 }} />
          ) : (
            <Target size={17} style={{ color: "var(--ek-primary)", flexShrink: 0 }} />
          )}
          <h3 className="font-bold truncate" style={{ fontSize: 15, color: "var(--ek-text-primary)" }}>
            {goal.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="ek-badge capitalize"
            style={{
              background:
                goal.goal_type === "yearly" ? "#F5F3FF" :
                goal.goal_type === "quarterly" ? "#EFF6FF" : "var(--ek-primary-50)",
              color:
                goal.goal_type === "yearly" ? "#7C3AED" :
                goal.goal_type === "quarterly" ? "#2563EB" : "var(--ek-primary)",
              fontSize: 11, padding: "2px 10px",
            }}
          >
            {goal.goal_type}
          </span>
          <button
            onClick={onDelete}
            className="ek-btn-icon"
            aria-label="Delete goal"
            style={{ color: "var(--ek-danger)" }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Period */}
      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
        <Calendar size={11} />
        <span>
          {new Date(goal.period_start).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}{" "}
          –{" "}
          {new Date(goal.period_end).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Amounts */}
      <div className="mt-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(earned)}
            </p>
            <p className="text-xs text-gray-500">
              of {formatCurrency(goal.target_amount)} target
            </p>
          </div>
          <div className="text-right">
            <p
              className={`text-sm font-semibold ${
                isComplete
                  ? "text-emerald-600"
                  : progress >= percentElapsed
                    ? "text-blue-600"
                    : "text-amber-600"
              }`}
            >
              {Math.round(progress)}%
            </p>
            {!isComplete && (
              <p className="text-xs text-gray-400">
                {formatCurrency(remaining)} to go
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
          {/* Target progress track */}
          <div
            className={`absolute inset-y-0 left-0 rounded-full transition-all duration-500 ${
              isComplete ? "bg-emerald-500" : isOnTrack ? "bg-indigo-500" : "bg-amber-500"
            }`}
            style={{ width: `${progress}%` }}
          />
          {/* Period elapsed marker */}
          <div
            className="absolute inset-y-0 w-0.5 bg-gray-400 opacity-50"
            style={{ left: `${percentElapsed}%` }}
          />
        </div>

        {/* Forecast */}
        {!isComplete && elapsedDays > 2 && (
          <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <TrendingUp size={12} className={isOnTrack ? "text-emerald-500" : "text-amber-500"} />
              <span>
                {isOnTrack ? (
                  <>On track · Forecasted: {formatCurrency(forecastedTotal)}</>
                ) : (
                  <>
                    Needs {formatCurrency(dailyRateNeeded)}/day ·{" "}
                    <span className="text-amber-600 font-medium">Behind pace</span>
                  </>
                )}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const { goals, isLoading, createGoal, deleteGoal, creating, deleting } = useGoals();
  const { invoices } = useInvoices();

  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Calculate earned for each goal (paid invoices within goal period)
  const goalMetrics = useMemo(() => {
    return goals.map((goal) => {
      const start = new Date(goal.period_start);
      const end = new Date(goal.period_end);
      end.setHours(23, 59, 59);

      const earned = invoices
        .filter((inv) => {
          if (inv.status !== "paid") return false;
          const paidDate = inv.paymentDate
            ? new Date(inv.paymentDate)
            : new Date(inv.issueDate);
          return paidDate >= start && paidDate <= end;
        })
        .reduce((sum, inv) => sum + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total, 0);

      return { goal, earned };
    });
  }, [goals, invoices]);

  async function handleCreate(form: {
    title: string;
    goal_type: GoalType;
    target_amount: string;
    period_start: string;
    period_end: string;
    notes: string;
  }) {
    await createGoal({
      title: form.title,
      goal_type: form.goal_type,
      target_amount: parseFloat(form.target_amount),
      period_start: form.period_start,
      period_end: form.period_end,
      notes: form.notes || undefined,
    });
    setShowForm(false);
  }

  // Summary stats
  const totalTarget = goals.reduce((s, g) => s + g.target_amount, 0);
  const totalEarned = goalMetrics.reduce((s, m) => s + m.earned, 0);
  const completedGoals = goalMetrics.filter((m) => m.earned >= m.goal.target_amount).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Goals"
        description="Track revenue targets and measure your progress"
      >
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          New Goal
        </button>
      </PageHeader>

      {/* Summary */}
      {goals.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Targets</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatCurrency(totalTarget)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{goals.length} active goals</p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Earned</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {formatCurrency(totalEarned)}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">
              {totalTarget > 0 ? Math.round((totalEarned / totalTarget) * 100) : 0}% of all targets
            </p>
          </div>
          <div className="rounded-xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Goals Completed</p>
            <p className="mt-1 text-2xl font-bold text-indigo-600">{completedGoals}</p>
            <p className="mt-0.5 text-xs text-gray-400">of {goals.length} goals</p>
          </div>
        </div>
      )}

      {/* Goal Cards */}
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 animate-pulse rounded-xl border bg-gray-100" />
          ))}
        </div>
      ) : goalMetrics.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <Target size={44} className="mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">No Goals Set</h3>
          <p className="mt-2 text-sm text-gray-500">
            Set a monthly, quarterly, or yearly revenue target to track your progress.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Set Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {goalMetrics.map(({ goal, earned }) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              earned={earned}
              onDelete={() => setDeletingId(goal.id)}
            />
          ))}
        </div>
      )}

      {showForm && (
        <GoalForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          isSubmitting={creating}
        />
      )}

      {deletingId && (
        <DeleteConfirmModal
          title="Delete Goal"
          description="Are you sure you want to delete this goal?"
          isDeleting={deleting}
          onConfirm={async () => {
            await deleteGoal(deletingId);
            setDeletingId(null);
          }}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
