import { supabase } from "../lib/supabase";
import {
  incrementUsageMetric,
  getUsageMetrics,
  type MetricType,
} from "./usage.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionPlan = "starter" | "professional" | "business";
export type SubscriptionStatus =
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "paused";

export interface Subscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string;
  razorpay_customer_id: string | null;
  razorpay_subscription_id: string | null;
  amount_paid: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

// ─── Plan Limits ──────────────────────────────────────────────────────────────

export interface PlanLimits {
  name: string;
  price_monthly: number; // INR
  clients: number; // -1 = unlimited
  projects: number; // -1 = unlimited
  invoices_per_month: number; // -1 = unlimited
  proposals_per_month: number;
  ai_queries_per_month: number;
  storage_bytes: number; // -1 = unlimited
  team_members: number; // -1 = unlimited
  client_portal: boolean;
  automation: boolean;
  advanced_reports: boolean;
  description: string;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  starter: {
    name: "Starter",
    price_monthly: 299,
    clients: 20,
    projects: 20,
    invoices_per_month: 30,
    proposals_per_month: 3,
    ai_queries_per_month: 10,
    storage_bytes: 500 * 1024 * 1024, // 500 MB
    team_members: 1,
    client_portal: false,
    automation: false,
    advanced_reports: false,
    description: "Perfect for solo freelancers just getting started",
  },
  professional: {
    name: "Professional",
    price_monthly: 799,
    clients: 200,
    projects: -1,
    invoices_per_month: -1,
    proposals_per_month: -1,
    ai_queries_per_month: 100,
    storage_bytes: 20 * 1024 * 1024 * 1024, // 20 GB
    team_members: 3,
    client_portal: true,
    automation: false,
    advanced_reports: true,
    description: "For growing freelancers and small agencies",
  },
  business: {
    name: "Business",
    price_monthly: 1499,
    clients: -1,
    projects: -1,
    invoices_per_month: -1,
    proposals_per_month: -1,
    ai_queries_per_month: 500,
    storage_bytes: 100 * 1024 * 1024 * 1024, // 100 GB
    team_members: -1,
    client_portal: true,
    automation: true,
    advanced_reports: true,
    description: "Full-featured for teams and large agencies",
  },
};

// ─── Usage Limits Check ───────────────────────────────────────────────────────

export type LimitedAction =
  | "create_client"
  | "create_project"
  | "create_invoice"
  | "create_proposal"
  | "use_ai"
  | "invite_team_member"
  | "use_portal"
  | "use_automation";

export interface LimitCheckResult {
  allowed: boolean;
  reason?: string;
  limit?: number;
  current?: number;
  upgradeRequired?: SubscriptionPlan;
}

// ─── Service ──────────────────────────────────────────────────────────────────

const TABLE = "subscriptions";

export async function getSubscription(): Promise<Subscription | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("[Subscription] fetch error:", error);
    return null;
  }

  // Auto-create starter subscription if none exists
  if (!data) {
    const { data: created, error: createError } = await supabase
      .from(TABLE)
      .insert({ user_id: user.id, plan: "starter", status: "trialing" })
      .select()
      .single();

    if (createError) {
      console.error("[Subscription] auto-provision error:", createError);
      return null;
    }

    return created as Subscription | null;
  }

  return data as Subscription;
}

export async function updateSubscriptionPlan(
  plan: SubscriptionPlan,
): Promise<{ error: Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: new Error("Not authenticated") };

  const { error } = await supabase
    .from(TABLE)
    .update({ plan, status: "active" })
    .eq("user_id", user.id);

  return { error: error as Error | null };
}

/**
 * Get this month's usage count for a metric.
 *
 * Delegates to usage.service.ts, which owns reads/writes against the
 * usage_metrics table, so there is one consistent code path instead of
 * a second, parallel implementation here.
 */
export async function getUsageThisMonth(metricType: string): Promise<number> {
  const metrics = await getUsageMetrics();
  return metrics.find((m) => m.metric_type === metricType)?.count ?? 0;
}

/**
 * Increment this month's usage count for a metric.
 *
 * Previously this called a Postgres RPC ("increment_usage_metric") that
 * does not exist in the schema; on failure it only logged a warning and
 * never actually recorded the usage. It now delegates to the
 * fetch-then-upsert implementation in usage.service.ts, which is the
 * single source of truth for usage_metrics writes.
 */
export async function incrementUsage(
  metricType: string,
  by = 1,
): Promise<void> {
  await incrementUsageMetric(metricType as MetricType, by);
}

export async function getBillingHistory() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: [], error: null };

  return supabase
    .from("billing_history")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
}

/**
 * Check if the current user's subscription allows a given action.
 * Pass current counts from the application state.
 */
export function checkLimit(
  subscription: Subscription | null,
  action: LimitedAction,
  currentCounts: {
    clients?: number;
    projects?: number;
    invoicesThisMonth?: number;
    proposalsThisMonth?: number;
    aiQueriesThisMonth?: number;
    teamMembers?: number;
  },
): LimitCheckResult {
  if (!subscription) {
    return { allowed: false, reason: "No active subscription found." };
  }

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";
  if (!isActive) {
    return {
      allowed: false,
      reason: "Your subscription is not active. Please renew to continue.",
    };
  }

  const limits = PLAN_LIMITS[subscription.plan];

  switch (action) {
    case "create_client": {
      if (limits.clients === -1) return { allowed: true };
      const current = currentCounts.clients ?? 0;
      if (current >= limits.clients) {
        return {
          allowed: false,
          reason: `You've reached the ${limits.clients} client limit on the ${limits.name} plan.`,
          limit: limits.clients,
          current,
          upgradeRequired:
            subscription.plan === "starter" ? "professional" : "business",
        };
      }
      return { allowed: true };
    }

    case "create_project": {
      if (limits.projects === -1) return { allowed: true };
      const current = currentCounts.projects ?? 0;
      if (current >= limits.projects) {
        return {
          allowed: false,
          reason: `You've reached the ${limits.projects} project limit on the ${limits.name} plan.`,
          limit: limits.projects,
          current,
          upgradeRequired:
            subscription.plan === "starter" ? "professional" : "business",
        };
      }
      return { allowed: true };
    }

    case "create_invoice": {
      if (limits.invoices_per_month === -1) return { allowed: true };
      const current = currentCounts.invoicesThisMonth ?? 0;
      if (current >= limits.invoices_per_month) {
        return {
          allowed: false,
          reason: `You've created ${current} invoices this month. The ${limits.name} plan allows ${limits.invoices_per_month}/month.`,
          limit: limits.invoices_per_month,
          current,
          upgradeRequired:
            subscription.plan === "starter" ? "professional" : "business",
        };
      }
      return { allowed: true };
    }

    case "create_proposal": {
      if (limits.proposals_per_month === -1) return { allowed: true };
      const current = currentCounts.proposalsThisMonth ?? 0;
      if (current >= limits.proposals_per_month) {
        return {
          allowed: false,
          reason: `You've created ${current} proposals this month. The ${limits.name} plan allows ${limits.proposals_per_month}/month.`,
          limit: limits.proposals_per_month,
          current,
          upgradeRequired:
            subscription.plan === "starter" ? "professional" : "business",
        };
      }
      return { allowed: true };
    }

    case "use_ai": {
      if (limits.ai_queries_per_month === -1) return { allowed: true };
      const current = currentCounts.aiQueriesThisMonth ?? 0;
      if (current >= limits.ai_queries_per_month) {
        return {
          allowed: false,
          reason: `You've used ${current} AI queries this month. The ${limits.name} plan includes ${limits.ai_queries_per_month}/month.`,
          limit: limits.ai_queries_per_month,
          current,
          upgradeRequired:
            subscription.plan === "starter" ? "professional" : "business",
        };
      }
      return { allowed: true };
    }

    case "invite_team_member": {
      if (limits.team_members === -1) return { allowed: true };
      const current = currentCounts.teamMembers ?? 1;
      if (current >= limits.team_members) {
        return {
          allowed: false,
          reason: `The ${limits.name} plan allows ${limits.team_members} team member(s). Upgrade to add more.`,
          limit: limits.team_members,
          current,
          upgradeRequired: "business",
        };
      }
      return { allowed: true };
    }

    case "use_portal": {
      if (!limits.client_portal) {
        return {
          allowed: false,
          reason: `Client Portal is not available on the ${limits.name} plan.`,
          upgradeRequired:
            subscription.plan === "starter" ? "professional" : "business",
        };
      }
      return { allowed: true };
    }

    case "use_automation": {
      if (!limits.automation) {
        return {
          allowed: false,
          reason: `Automation is only available on the Business plan.`,
          upgradeRequired: "business",
        };
      }
      return { allowed: true };
    }

    default:
      return { allowed: true };
  }
}
