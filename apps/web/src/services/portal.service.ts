import { supabase } from "../lib/supabase";
import type { PortalToken, CreatePortalTokenPayload } from "../features/portal/types/portal";
import type { Client } from "./client.service";
import { createNotification } from "./notification.service";

export async function createPortalToken(payload: CreatePortalTokenPayload) {
  return supabase
    .from("portal_tokens")
    .insert([payload])
    .select()
    .single();
}

export async function validatePortalToken(token: string) {
  const { data, error } = await supabase
    .from("portal_tokens")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) return null;
  const portalToken = data as PortalToken;

  if (portalToken.is_revoked) return null;
  if (new Date(portalToken.expires_at) < new Date()) return null;

  return portalToken;
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
    throw new Error("Invalid or expired token");
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
