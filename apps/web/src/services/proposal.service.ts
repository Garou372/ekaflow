import { supabase } from "../lib/supabase";

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

  return { data: data as Proposal | null, error };
}

export async function deleteProposal(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);

  return { error };
}
