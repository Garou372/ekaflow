export type NotificationType = "proposal_accepted" | "invoice_paid" | "system" | "reminder";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export type CreateNotificationPayload = Omit<Notification, "id" | "created_at" | "is_read">;
