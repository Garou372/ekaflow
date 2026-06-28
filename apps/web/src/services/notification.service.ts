import { supabase } from "../lib/supabase";
import type { Notification, CreateNotificationPayload } from "../features/notifications/types/notification";

export async function getNotifications() {
  return supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false });
}

export async function createNotification(payload: CreateNotificationPayload) {
  return supabase
    .from("notifications")
    .insert([payload])
    .select()
    .single();
}

export async function markAsRead(id: string) {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", id)
    .select()
    .single();
}

export async function markAllAsRead() {
  return supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("is_read", false);
}
