import { supabase } from "../lib/supabase";
import { auditService, AUDIT_ACTIONS } from "./audit.service";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProposalStatus = "draft" | "sent" | "accepted" | "rejected";

export type ProposalItem = {
  description: string;
  quantity: number;
  unit_price: number;
};

export type Proposal = {
  id: string;
  user_id: string;
  client_id: string;
  title: string;
  status: ProposalStatus;
  notes: string | null;
  items: ProposalItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  created_at: string;
  updated_at: string;
};

export type CreateProposalPayload = {
  title: string;
  client_id: string;
  status: ProposalStatus;
  notes: string;
  items: ProposalItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
};

export type UpdateProposalPayload = Partial<CreateProposalPayload>;

// ─── Service ──────────────────────────────────────────────────────────────────

const TABLE = "proposals";

export async function getProposals() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data as Proposal[] | null) ?? [], error };
}

export async function getProposal(id: string) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .single();

  return { data: data as Proposal | null, error };
}

export async function createProposal(payload: CreateProposalPayload) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
    .select()
    .single();

  if (!error && data) {
    const proposal = data as Proposal;
    await auditService.log({
      action: AUDIT_ACTIONS.PROPOSAL_CREATED,
      entity_type: "proposal",
      entity_id: proposal.id,
      metadata: {
        title: payload.title,
        client_id: payload.client_id,
        status: payload.status,
        total: payload.total,
      },
    });
  }

  return { data: data as Proposal | null, error };
}

export async function updateProposal(
  id: string,
  payload: UpdateProposalPayload,
) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (!error && data) {
    // Emit a specific status-change event when status transitions
    const action =
      payload.status !== undefined
        ? AUDIT_ACTIONS.PROPOSAL_STATUS_CHANGED
        : AUDIT_ACTIONS.PROPOSAL_UPDATED;

    await auditService.log({
      action,
      entity_type: "proposal",
      entity_id: id,
      metadata: {
        ...(payload.status !== undefined && { status: payload.status }),
        updated_fields: Object.keys(payload),
      },
    });
  }

  return { data: data as Proposal | null, error };
}

export async function deleteProposal(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  if (!error) {
    await auditService.log({
      action: AUDIT_ACTIONS.PROPOSAL_DELETED,
      entity_type: "proposal",
      entity_id: id,
    });
  }

  return { error };
}
