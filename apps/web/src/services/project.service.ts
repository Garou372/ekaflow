import { supabase } from "../lib/supabase";
import { auditService } from "./audit.service";
import type { CreateProjectPayload } from "../features/projects/types/project";

// ─── Error helper (matches project-wide convention) ───────────────────────────
function parseError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(String(err));
}

// ─── Audit actions for projects ───────────────────────────────────────────────
// These extend the AUDIT_ACTIONS defined in audit.service via direct string
// literals because project actions were not in the original AUDIT_ACTIONS set.
// When AUDIT_ACTIONS is extended in a later sprint, replace these.
const PROJECT_AUDIT_ACTIONS = {
  CREATED: "project.created",
  UPDATED: "project.updated",
  DELETED: "project.deleted",
} as const;

// ─── Service ──────────────────────────────────────────────────────────────────

export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    data: data ?? [],
    error: error ? parseError(error) : null,
  };
}

export async function createProject(payload: CreateProjectPayload) {
  const { data, error } = await supabase
    .from("projects")
    .insert([payload])
    .select()
    .single();

  if (!error && data) {
    await auditService.log({
      action: PROJECT_AUDIT_ACTIONS.CREATED,
      entity_type: "project",
      entity_id: (data as { id: string }).id,
      metadata: { name: (payload as Record<string, unknown>).name ?? "" },
    });
  }

  return {
    data: data ?? null,
    error: error ? parseError(error) : null,
  };
}

export async function updateProject(
  id: string,
  payload: Partial<CreateProjectPayload>,
) {
  const { data, error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (!error && data) {
    await auditService.log({
      action: PROJECT_AUDIT_ACTIONS.UPDATED,
      entity_type: "project",
      entity_id: id,
      metadata: { updated_fields: Object.keys(payload) },
    });
  }

  return {
    data: data ?? null,
    error: error ? parseError(error) : null,
  };
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (!error) {
    await auditService.log({
      action: PROJECT_AUDIT_ACTIONS.DELETED,
      entity_type: "project",
      entity_id: id,
    });
  }

  return { error: error ? parseError(error) : null };
}
