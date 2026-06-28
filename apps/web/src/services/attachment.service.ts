import { supabase } from "../lib/supabase";

export type EntityType = "client" | "project" | "invoice" | "proposal" | "expense";

export interface Attachment {
  id: string;
  user_id: string;
  entity_type: EntityType;
  entity_id: string;
  file_name: string;
  file_size: number | null;
  mime_type: string | null;
  storage_path: string;
  created_at: string;
}

export async function uploadAttachment(
  entityType: EntityType,
  entityId: string,
  file: File
): Promise<{ data: Attachment | null; error: Error | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error("Not authenticated");

    const fileExt = file.name.split('.').pop();
    const filePath = `${userData.user.id}/${entityType}/${entityId}/${Math.random().toString(36).slice(2)}_${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('attachments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Save metadata to attachments table
    const { data, error } = await supabase
      .from("attachments")
      .insert([
        {
          user_id: userData.user.id,
          entity_type: entityType,
          entity_id: entityId,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          storage_path: filePath,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function getAttachments(
  entityType: EntityType,
  entityId: string
): Promise<{ data: Attachment[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from("attachments")
      .select("*")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

export async function downloadAttachment(path: string, fileName: string) {
  try {
    const { data, error } = await supabase.storage
      .from('attachments')
      .download(path);

    if (error) throw error;
    
    // Trigger download in browser
    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Failed to download attachment:", err);
    throw err;
  }
}

export async function deleteAttachment(id: string, storagePath: string) {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('attachments')
      .remove([storagePath]);

    if (storageError) throw storageError;

    // Delete from DB
    const { error } = await supabase
      .from("attachments")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return { error: null };
  } catch (err: any) {
    return { error: err };
  }
}
