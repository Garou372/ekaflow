import { supabase } from "../lib/supabase";
import type { CreateExpensePayload } from "../features/expenses/types/expense";

export async function getExpenses() {
  return supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });
}

export async function createExpense(payload: CreateExpensePayload) {
  return supabase
    .from("expenses")
    .insert([payload])
    .select()
    .single();
}

export async function updateExpense(
  id: string,
  payload: Partial<CreateExpensePayload>
) {
  return supabase
    .from("expenses")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteExpense(id: string) {
  return supabase.from("expenses").delete().eq("id", id);
}
