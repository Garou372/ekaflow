import { supabase } from "../lib/supabase";

export type TemplateType = "proposal" | "invoice" | "email";

export interface Template {
  id: string;
  user_id: string;
  name: string;
  template_type: TemplateType;
  content: any;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateTemplatePayload = {
  name: string;
  template_type: TemplateType;
  content: any;
  is_default?: boolean;
};

export async function getTemplates(templateType?: TemplateType) {
  let query = supabase.from("templates").select("*").order("name", { ascending: true });
  
  if (templateType) {
    query = query.eq("template_type", templateType);
  }

  return query;
}

export async function getTemplate(id: string) {
  return supabase.from("templates").select("*").eq("id", id).single();
}

export async function createTemplate(payload: CreateTemplatePayload) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error("Not authenticated");

  // If this is set as default, unset other defaults
  if (payload.is_default) {
    await supabase
      .from("templates")
      .update({ is_default: false })
      .eq("template_type", payload.template_type)
      .eq("user_id", userData.user.id);
  }

  return supabase
    .from("templates")
    .insert([{ ...payload, user_id: userData.user.id }])
    .select()
    .single();
}

export async function updateTemplate(id: string, payload: Partial<CreateTemplatePayload>) {
  if (payload.is_default && payload.template_type) {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      await supabase
        .from("templates")
        .update({ is_default: false })
        .eq("template_type", payload.template_type)
        .eq("user_id", userData.user.id);
    }
  }

  return supabase
    .from("templates")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
}

export async function deleteTemplate(id: string) {
  return supabase.from("templates").delete().eq("id", id);
}
