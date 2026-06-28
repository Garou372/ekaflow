import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GoalType = "monthly" | "quarterly" | "yearly" | "custom";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  goal_type: GoalType;
  target_amount: number;
  period_start: string; // ISO date string
  period_end: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export type CreateGoalPayload = Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Generate period start/end for common goal types */
export function generatePeriodDates(type: GoalType): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth(); // 0-indexed

  switch (type) {
    case "monthly":
      return {
        start: new Date(y, m, 1).toISOString().split("T")[0],
        end: new Date(y, m + 1, 0).toISOString().split("T")[0],
      };
    case "quarterly": {
      const q = Math.floor(m / 3);
      return {
        start: new Date(y, q * 3, 1).toISOString().split("T")[0],
        end: new Date(y, q * 3 + 3, 0).toISOString().split("T")[0],
      };
    }
    case "yearly":
      return {
        start: new Date(y, 0, 1).toISOString().split("T")[0],
        end: new Date(y, 11, 31).toISOString().split("T")[0],
      };
    default:
      return {
        start: now.toISOString().split("T")[0],
        end: new Date(y + 1, 0, 1).toISOString().split("T")[0],
      };
  }
}

// ─── Service ──────────────────────────────────────────────────────────────────

const TABLE = "goals";

export async function getGoals() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("period_start", { ascending: false });

  return { data: data as Goal[] | null, error };
}

export async function createGoal(payload: CreateGoalPayload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();

  return { data: data as Goal | null, error };
}

export async function updateGoal(id: string, payload: Partial<CreateGoalPayload>) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  return { data: data as Goal | null, error };
}

export async function deleteGoal(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}
