import { supabase } from "../lib/supabase";

export interface Workspace {
  id: string;
  name: string;
  owner_id: string;
  slug: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type WorkspaceRole = "owner" | "admin" | "manager" | "employee";

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string | null;
  role: WorkspaceRole;
  invited_email: string | null;
  invite_token: string | null;
  invite_expires_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

/**
 * Fetch all workspaces the user is a part of (owner or member).
 */
export async function getMyWorkspaces() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  // RLS allows seeing owned workspaces or joined workspaces
  const { data, error } = await supabase
    .from("workspaces")
    .select(`
      *,
      workspace_members ( role )
    `)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * Create a new workspace. The current user becomes the owner.
 */
export async function createWorkspace(name: string, slug?: string) {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("workspaces")
    .insert({
      name,
      owner_id: user.user.id,
      slug: slug || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Workspace;
}

/**
 * Update a workspace
 */
export async function updateWorkspace(id: string, updates: Partial<Workspace>) {
  const { data, error } = await supabase
    .from("workspaces")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Workspace;
}

/**
 * Fetch members of a workspace
 */
export async function getWorkspaceMembers(workspaceId: string) {
  const { data, error } = await supabase
    .from("workspace_members")
    .select(`
      *,
      profiles:user_id ( full_name, email, avatar_url )
    `)
    .eq("workspace_id", workspaceId);

  if (error) throw error;
  return data;
}

/**
 * Invite a user to the workspace
 */
export async function inviteMember(workspaceId: string, email: string, role: WorkspaceRole) {
  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const { data, error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      role,
      invited_email: email,
      invite_token: inviteToken,
      invite_expires_at: expiresAt.toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as WorkspaceMember;
}
