import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ClientPriority = "vip" | "high" | "normal" | "low";
export type ClientNoteType = "general" | "meeting" | "call" | "email" | "follow_up";

export type Client = {
  id?: string;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  gst_number?: string;
  address?: string;
  notes?: string;
  // CRM fields (Sprint 10)
  priority?: ClientPriority;
  tags?: string[];
  last_contacted_at?: string;
  next_follow_up_at?: string;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
};

export type ClientNote = {
  id: string;
  client_id: string;
  user_id: string;
  content: string;
  note_type: ClientNoteType;
  created_at: string;
};

export type CreateClientNotePayload = {
  client_id: string;
  content: string;
  note_type: ClientNoteType;
};

// ─── Client CRUD ──────────────────────────────────────────────────────────────

const TABLE = "clients";
const NOTES_TABLE = "client_notes";

export async function getClients() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("is_favorite", { ascending: false })
    .order("priority", { ascending: true })
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function createClient(payload: Omit<Client, "id" | "created_at" | "updated_at">) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from(TABLE)
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();

  return { data, error };
}

export async function updateClient(id: string, payload: Partial<Client>) {
  const { data, error } = await supabase
    .from(TABLE)
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function deleteClient(id: string) {
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  return { error };
}

// ─── Client Notes ─────────────────────────────────────────────────────────────

export async function getClientNotes(clientId: string) {
  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });

  return { data: data as ClientNote[] | null, error };
}

export async function createClientNote(payload: CreateClientNotePayload) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from(NOTES_TABLE)
    .insert({ ...payload, user_id: user?.id })
    .select()
    .single();

  return { data: data as ClientNote | null, error };
}

export async function deleteClientNote(id: string) {
  const { error } = await supabase.from(NOTES_TABLE).delete().eq("id", id);
  return { error };
}

// ─── CRM Helpers ──────────────────────────────────────────────────────────────

export async function toggleFavorite(id: string, isFavorite: boolean) {
  return updateClient(id, { is_favorite: isFavorite });
}

export async function setNextFollowUp(id: string, date: string | null) {
  return updateClient(id, { next_follow_up_at: date ?? undefined });
}

export async function recordContactDate(id: string) {
  return updateClient(id, { last_contacted_at: new Date().toISOString() });
}
