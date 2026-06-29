import { supabase } from "../lib/supabase";
import type {
  PortalToken,
  CreatePortalTokenPayload,
} from "../features/portal/types/portal";
import type { Client } from "./client.service";
import { createNotification } from "./notification.service";

export async function createPortalToken(payload: CreatePortalTokenPayload) {
  return supabase.from("portal_tokens").insert([payload]).select().single();
}

/**
 * Fetch the raw portal_tokens row for a given token, with no status
 * filtering. Shared by validatePortalToken (used by mutation paths,
 * which only need a pass/fail signal) and checkPortalAccess (used by
 * the dashboard UI, which needs to explain *why* access was denied),
 * so there is a single query path instead of two parallel ones.
 */
async function fetchPortalTokenRow(token: string): Promise<PortalToken | null> {
  const { data, error } = await supabase
    .from("portal_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  return data as PortalToken;
}

export async function validatePortalToken(token: string) {
  const portalToken = await fetchPortalTokenRow(token);
  if (!portalToken) return null;

  if (portalToken.is_revoked) return null;
  if (new Date(portalToken.expires_at) < new Date()) return null;

  return portalToken;
}

export type PortalAccessDenialReason = "not_found" | "expired" | "revoked";

export interface PortalAccessResult {
  token: PortalToken | null;
  denied: boolean;
  reason?: PortalAccessDenialReason;
}

/**
 * Like validatePortalToken, but reports *why* access is denied
 * (not found / expired / revoked) instead of collapsing every failure
 * into a generic null. The UI uses this to give clients clear,
 * specific messaging instead of one generic "invalid link" screen.
 *
 * Note: a revoked token may mean the document was explicitly revoked,
 * or it may mean the underlying action (e.g. proposal acceptance) was
 * already completed, since acceptPortalProposal revokes the token
 * after use. Callers that care about that distinction should inspect
 * the underlying entity themselves via getPortalEntity using the
 * returned token (which is still populated even when denied).
 */
export async function checkPortalAccess(
  token: string,
): Promise<PortalAccessResult> {
  const portalToken = await fetchPortalTokenRow(token);

  if (!portalToken) {
    return { token: null, denied: true, reason: "not_found" };
  }

  if (portalToken.is_revoked) {
    return { token: portalToken, denied: true, reason: "revoked" };
  }

  if (new Date(portalToken.expires_at) < new Date()) {
    return { token: portalToken, denied: true, reason: "expired" };
  }

  return { token: portalToken, denied: false };
}

export async function getPortalEntity(tokenInfo: PortalToken) {
  // Fetch the client
  const { data: clientData } = await supabase
    .from("clients")
    .select("*")
    .eq("id", tokenInfo.client_id)
    .single();

  let entityData = null;

  if (tokenInfo.entity_type === "proposal") {
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .eq("id", tokenInfo.entity_id)
      .single();
    entityData = data;
  } else if (tokenInfo.entity_type === "invoice") {
    const { data } = await supabase
      .from("invoices")
      .select("*")
      .eq("id", tokenInfo.entity_id)
      .single();
    entityData = data;
  }

  return {
    client: clientData as Client,
    entity: entityData,
  };
}

export async function acceptPortalProposal(tokenString: string) {
  const token = await validatePortalToken(tokenString);
  if (!token || token.entity_type !== "proposal") {
    throw new Error(
      "This proposal has already been accepted or the link is no longer valid.",
    );
  }

  // Update proposal status
  const { error } = await supabase
    .from("proposals")
    .update({ status: "accepted" })
    .eq("id", token.entity_id);

  if (error) throw error;

  // Revoke token after use (optional, but good practice for approvals)
  await supabase
    .from("portal_tokens")
    .update({ is_revoked: true })
    .eq("id", token.id);

  // Notify freelancer
  await createNotification({
    type: "proposal_accepted",
    title: "Proposal Accepted!",
    message: `A client has accepted proposal #${token.entity_id.substring(0, 8)}.`,
    link_url: `/proposals`, // Or deep link to proposal
  });

  return true;
}

export async function revokePortalToken(tokenString: string) {
  const token = await validatePortalToken(tokenString);
  if (!token) throw new Error("Invalid token");

  const { error } = await supabase
    .from("portal_tokens")
    .update({ is_revoked: true })
    .eq("id", token.id);

  if (error) throw error;
  return true;
}
