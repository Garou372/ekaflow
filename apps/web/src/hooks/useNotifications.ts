import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notification.service";
import type {
  CreateNotificationPayload,
  Notification,
} from "../features/notifications/types/notification";

// ─── Query Keys ──────────────────────────────────────────────────────────────
const KEYS = {
  all: ["notifications"] as const,
};

// ─── Hook ────────────────────────────────────────────────────────────────────
export default function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: KEYS.all,
    queryFn: async () => {
      const { data, error } = await getNotifications();
      if (error) throw error;
      return data as Notification[];
    },
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotificationPayload) =>
      createNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  return {
    notifications: data ?? [],
    unreadCount: (data ?? []).filter((n) => !n.is_read).length,
    isLoading,
    error,
    createNotification: createMutation.mutateAsync,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    deleteNotification: deleteMutation.mutateAsync,
  };
}
