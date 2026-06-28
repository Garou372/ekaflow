import { supabase } from "../lib/supabase";
import type { TimeEntry, CreateTimeEntryPayload, UpdateTimeEntryPayload } from "../features/time/types/time";

export async function getTimeEntries() {
  return supabase
    .from("time_entries")
    .select("*")
    .order("start_time", { ascending: false });
}

export async function createTimeEntry(payload: CreateTimeEntryPayload) {
  return supabase
    .from("time_entries")
    .insert([{ ...payload, is_billed: payload.is_billed ?? false }])
    .select()
    .single();
}

export async function updateTimeEntry(
  id: string,
  payload: UpdateTimeEntryPayload
) {
  return supabase
    .from("time_entries")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteTimeEntry(id: string) {
  return supabase.from("time_entries").delete().eq("id", id);
}
