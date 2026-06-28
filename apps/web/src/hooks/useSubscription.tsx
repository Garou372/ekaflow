import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  getSubscription,
  updateSubscriptionPlan,
  checkLimit,
  PLAN_LIMITS,
  type Subscription,
  type SubscriptionPlan,
  type LimitedAction,
  type LimitCheckResult,
} from "../services/subscription.service";
import useClients from "./useClients";
import useProjects from "./useProjects";
import useInvoices from "./useInvoices";
import useProposals from "./useProposals";
import type { Proposal } from "../services/proposal.service";
import { useToast } from "./useToast";

// ─── Context ──────────────────────────────────────────────────────────────────

interface SubscriptionContextValue {
  subscription: Subscription | null;
  isLoading: boolean;
  isTrialing: boolean;
  isActive: boolean;
  daysLeftInTrial: number;
  planLimits: typeof PLAN_LIMITS[SubscriptionPlan];
  canPerform: (action: LimitedAction) => LimitCheckResult;
  upgradePlan: (plan: SubscriptionPlan) => Promise<void>;
  upgrading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["subscription"],
    queryFn: getSubscription,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Pull current counts for limit checking
  const { clients } = useClients();
  const { projects } = useProjects();
  const { invoices } = useInvoices();
  const { proposals } = useProposals();

  const upgradeMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) => updateSubscriptionPlan(plan),
    onSuccess: (result, plan) => {
      if (result.error) {
        errorToast("Upgrade failed", result.error.message);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      success(
        "Plan upgraded!",
        `You're now on the ${PLAN_LIMITS[plan].name} plan.`,
      );
    },
    onError: (err: Error) => errorToast("Upgrade failed", err.message),
  });

  const now = new Date();
  const trialEnd = subscription?.trial_ends_at
    ? new Date(subscription.trial_ends_at)
    : null;
  const daysLeftInTrial = trialEnd
    ? Math.max(Math.ceil((trialEnd.getTime() - now.getTime()) / 86400000), 0)
    : 0;

  const isTrialing = subscription?.status === "trialing";
  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  const plan = subscription?.plan ?? "starter";
  const planLimits = PLAN_LIMITS[plan];

  // Build current counts for limit checking
  const now_ = new Date();
  const currentMonthStart = new Date(now_.getFullYear(), now_.getMonth(), 1);

  const invoicesThisMonth = invoices.filter(
    (inv) => new Date(inv.createdAt) >= currentMonthStart,
  ).length;

  const proposalsThisMonth = (proposals as Proposal[]).filter(
    (p) => new Date(p.created_at) >= currentMonthStart,
  ).length;

  function canPerform(action: LimitedAction): LimitCheckResult {
    return checkLimit(subscription ?? null, action, {
      clients: clients.length,
      projects: projects.length,
      invoicesThisMonth,
      proposalsThisMonth,
      aiQueriesThisMonth: 0, // tracked separately via usage_metrics
      teamMembers: 1, // default; updated by team hook
    });
  }

  const value: SubscriptionContextValue = {
    subscription: subscription ?? null,
    isLoading,
    isTrialing,
    isActive,
    daysLeftInTrial,
    planLimits,
    canPerform,
    upgradePlan: async (plan) => {
      await upgradeMutation.mutateAsync(plan);
    },
    upgrading: upgradeMutation.isPending,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error(
      "useSubscription must be used inside SubscriptionProvider",
    );
  }
  return ctx;
}
