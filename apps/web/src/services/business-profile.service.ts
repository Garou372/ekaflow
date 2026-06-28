import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BusinessProfile {
  id: string;
  user_id: string;
  company_name: string;
  address: string;
  email: string;
  website?: string;
  tax_id?: string;
  gstin?: string;
  upi_id?: string;
  invoice_prefix: string;
  currency: string;
  default_payment_terms: number;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export type UpdateBusinessProfilePayload = Omit<
  BusinessProfile,
  "id" | "user_id" | "created_at" | "updated_at"
>;

// ─── Service ──────────────────────────────────────────────────────────────────

const TABLE = "business_profiles";

export async function getBusinessProfile(): Promise<BusinessProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found (new user with no profile yet)
    console.error("[BusinessProfile] fetch error:", error);
    return null;
  }

  return data as BusinessProfile | null;
}

export async function upsertBusinessProfile(
  payload: Partial<UpdateBusinessProfilePayload>,
): Promise<{ data: BusinessProfile | null; error: Error | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: new Error("Not authenticated") };
  }

  const { data, error } = await supabase
    .from(TABLE)
    .upsert(
      {
        user_id: user.id,
        ...payload,
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  return { data: data as BusinessProfile | null, error: error as Error | null };
}

/**
 * Upload a logo file to Supabase Storage.
 * Returns the public URL on success.
 */
export async function uploadBusinessLogo(file: File): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const ext = file.name.split(".").pop();
  const path = `logos/${user.id}/logo.${ext}`;

  const { error } = await supabase.storage
    .from("business-assets")
    .upload(path, file, { upsert: true });

  if (error) {
    console.error("[BusinessProfile] logo upload error:", error);
    return null;
  }

  const { data } = supabase.storage
    .from("business-assets")
    .getPublicUrl(path);

  return data?.publicUrl ?? null;
}
