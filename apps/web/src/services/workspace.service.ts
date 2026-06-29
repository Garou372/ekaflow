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
    .select(
      `
      *,
      workspace_members ( role )
    `,
    )
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
    .select(
      `
      *,
      profiles:user_id ( full_name, email, avatar_url )
    `,
    )
    .eq("workspace_id", workspaceId);

  if (error) throw error;
  return data;
}

/**
 * Invite a user to the workspace.
 *
 * Guards against the duplicate-invite edge case: an email that is already
 * an accepted member, or already has a pending invite, in this workspace.
 */
export async function inviteMember(
  workspaceId: string,
  email: string,
  role: WorkspaceRole,
) {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: existingMembers, error: existingError } = await supabase
    .from("workspace_members")
    .select(
      `
      id,
      invited_email,
      accepted_at,
      profiles:user_id ( email )
    `,
    )
    .eq("workspace_id", workspaceId);

  if (existingError) throw existingError;

  const alreadyInWorkspace = (existingMembers || []).some((member: any) => {
    const memberEmail =
      member.profiles?.email?.toLowerCase() ||
      member.invited_email?.toLowerCase();
    return memberEmail === normalizedEmail;
  });

  if (alreadyInWorkspace) {
    throw new Error(
      "This email is already a member of this workspace or has a pending invitation.",
    );
  }

  const inviteToken = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  const { data, error } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspaceId,
      role,
      invited_email: normalizedEmail,
      invite_token: inviteToken,
      invite_expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as WorkspaceMember;
}

export interface InviteDetails {
  memberId: string;
  role: WorkspaceRole;
  workspaceName: string;
  isExpired: boolean;
  isAccepted: boolean;
}

/**
 * Look up a pending invite by its token, surfacing whether it is expired
 * or has already been accepted so the UI can show the correct state
 * instead of a generic "invalid token" error.
 */
export async function getInviteByToken(token: string): Promise<InviteDetails> {
  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      id,
      role,
      accepted_at,
      invite_expires_at,
      workspaces ( name )
    `,
    )
    .eq("invite_token", token)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error("Invalid or expired invitation token.");
  }

  const isAccepted = !!data.accepted_at;
  const isExpired = data.invite_expires_at
    ? new Date(data.invite_expires_at) < new Date()
    : false;

  return {
    memberId: data.id,
    role: data.role,
    workspaceName: (data.workspaces as any)?.name ?? "Workspace",
    isExpired,
    isAccepted,
  };
}

/**
 * Accept a pending invite for the currently authenticated user.
 * Uses accepted_at IS NULL as an optimistic guard so a token cannot be
 * redeemed twice (e.g. double-submit or a stale tab).
 */
export async function acceptInvite(memberId: string, userId: string) {
  const { data, error } = await supabase
    .from("workspace_members")
    .update({
      user_id: userId,
      invite_token: null,
      invite_expires_at: null,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .is("accepted_at", null)
    .select()
    .single();

  if (error) throw error;
  if (!data) {
    throw new Error(
      "This invitation has already been accepted or is no longer valid.",
    );
  }
  return data as WorkspaceMember;
}

/**
 * Revoke a pending (not yet accepted) invitation.
 */
export async function cancelInvite(memberId: string) {
  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId)
    .is("accepted_at", null);

  if (error) throw error;
}

/**
 * Change an existing member's role within the workspace.
 */
export async function updateMemberRole(memberId: string, role: WorkspaceRole) {
  const { data, error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId)
    .select()
    .single();

  if (error) throw error;
  return data as WorkspaceMember;
}

/**
 * Remove a member (or pending invite) from the workspace entirely.
 */
export async function removeMember(memberId: string) {
  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId);

  if (error) throw error;
}
