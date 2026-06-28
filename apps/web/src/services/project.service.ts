import { supabase } from "../lib/supabase";
import type { CreateProjectPayload } from "../features/projects/types/project";

export async function getProjects() {
  return supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createProject(payload: CreateProjectPayload) {
  return supabase
    .from("projects")
    .insert([payload])
    .select()
    .single();
}

export async function updateProject(
  id: string,
  payload: Partial<CreateProjectPayload>
) {
  return supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteProject(id: string) {
  return supabase.from("projects").delete().eq("id", id);
}
