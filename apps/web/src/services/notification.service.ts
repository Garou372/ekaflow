import { supabase } from "../lib/supabase";
import type {
  CreateNotificationPayload,
  Notification,
} from "../features/notifications/types/notification";

function parseError(err: unknown): Error {
  if (err instanceof Error) return err;
  return new Error(String(err));
}

export async function getNotifications(): Promise<{
  data: Notification[];
  error: Error | null;
}> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    data: (data as Notification[] | null) ?? [],
    error: error ? parseError(error) : null,
  };
}

export async function createNotification(
  payload: CreateNotificationPayload,
): Promise<{ data: Notification | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("notifications")
    .insert([payload])
    .select()
    .single();

  return {
    data: data as Notification | null,
    error: error ? parseError(error) : null,
  };
}

export async function markAsRead(
  id: string,
): Promise<{ data: Notification | null; error: Error | null }> {
  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single();

  return {
    data: data as Notification | null,
    error: error ? parseError(error) : null,
  };
}

export async function markAllAsRead(): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);

  return { error: error ? parseError(error) : null };
}

export async function deleteNotification(
  id: string,
): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", id);

  return { error: error ? parseError(error) : null };
}