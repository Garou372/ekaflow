import { supabase } from "../lib/supabase";

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
  created_at?: string;
  updated_at?: string;
};

const TABLE = "clients";

export async function getClients() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false });

  return { data, error };
}

export async function createClient(payload: Client) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert(payload)
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
