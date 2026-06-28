import { supabase } from "../lib/supabase";

export type MetricType = 'invoice_created' | 'proposal_created' | 'ai_query' | 'storage_bytes' | 'client_created' | 'project_created';

export interface UsageMetric {
  id: string;
  user_id: string;
  metric_type: MetricType;
  period_month: string;
  count: number;
  updated_at: string;
}

const getCurrentPeriodMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

export async function getUsageMetrics() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  const periodMonth = getCurrentPeriodMonth();

  const { data, error } = await supabase
    .from("usage_metrics")
    .select("*")
    .eq("period_month", periodMonth);

  if (error) throw error;
  return data as UsageMetric[];
}

export async function incrementUsageMetric(metricType: MetricType, amount = 1) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const periodMonth = getCurrentPeriodMonth();

  // In Supabase we typically use RPC to safely increment, 
  // but for simplicity in Sprint 11 we might just do upsert.
  // Assuming a generic increment RPC exists or we just fetch and update.
  // For production readiness, an RPC "increment_usage" should be created.
  // We'll simulate it for now.
  
  const { data: existing, error: fetchErr } = await supabase
    .from("usage_metrics")
    .select("id, count")
    .eq("user_id", userData.user.id)
    .eq("metric_type", metricType)
    .eq("period_month", periodMonth)
    .single();

  if (fetchErr && fetchErr.code !== 'PGRST116') {
    throw fetchErr;
  }

  const newCount = (existing?.count ?? 0) + amount;

  const { data, error } = await supabase
    .from("usage_metrics")
    .upsert({
      id: existing?.id, // undefined means insert, defined means update
      user_id: userData.user.id,
      metric_type: metricType,
      period_month: periodMonth,
      count: newCount,
    }, { onConflict: 'user_id, metric_type, period_month' })
    .select()
    .single();

  if (error) throw error;
  return data as UsageMetric;
}
