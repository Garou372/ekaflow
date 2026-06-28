import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedbackType = "bug" | "feature" | "general";
export type FeedbackStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Feedback {
  id: string;
  user_id: string | null;
  feedback_type: FeedbackType;
  title: string;
  description: string;
  current_route: string | null;
  browser_info: string | null;
  app_version: string | null;
  screenshot_url: string | null;
  status: FeedbackStatus;
  created_at: string;
}

export type CreateFeedbackPayload = {
  feedback_type: FeedbackType;
  title: string;
  description: string;
  screenshot?: File;
};

// ─── App version ──────────────────────────────────────────────────────────────

const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "1.0.0";

// ─── Service ──────────────────────────────────────────────────────────────────

export async function submitFeedback(
  payload: CreateFeedbackPayload,
): Promise<{ data: Feedback | null; error: Error | null }> {
  try {
    const { data: userData } = await supabase.auth.getUser();

    let screenshotUrl: string | null = null;

    // Upload screenshot if provided
    if (payload.screenshot) {
      const userId = userData.user?.id ?? "anon";
      const ext = payload.screenshot.name.split(".").pop();
      const path = `feedback/${userId}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from("attachments")
        .upload(path, payload.screenshot);

      if (!uploadErr) {
        const { data: urlData } = supabase.storage
          .from("attachments")
          .getPublicUrl(path);
        screenshotUrl = urlData?.publicUrl ?? null;
      }
    }

    const { data, error } = await supabase
      .from("feedback")
      .insert({
        user_id: userData.user?.id ?? null,
        feedback_type: payload.feedback_type,
        title: payload.title,
        description: payload.description,
        current_route: window.location.pathname,
        browser_info: navigator.userAgent.slice(0, 200),
        app_version: APP_VERSION,
        screenshot_url: screenshotUrl,
        status: "open",
      })
      .select()
      .single();

    if (error) throw error;
    return { data: data as Feedback, error: null };
  } catch (err) {
    return { data: null, error: err as Error };
  }
}

export async function getAllFeedback(status?: FeedbackStatus) {
  let query = supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  return query;
}

export async function updateFeedbackStatus(id: string, status: FeedbackStatus) {
  return supabase.from("feedback").update({ status }).eq("id", id);
}
