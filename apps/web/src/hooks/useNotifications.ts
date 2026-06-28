import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
} from "../services/notification.service";
import type { CreateNotificationPayload, Notification } from "../features/notifications/types/notification";

export default function useNotifications() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await getNotifications();
      if (error) throw error;
      return (data as Notification[]) ?? [];
    },
    // Poll every 30 seconds for new notifications
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateNotificationPayload) => createNotification(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
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
  };
}
