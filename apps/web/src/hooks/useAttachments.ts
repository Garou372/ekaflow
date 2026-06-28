import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  getAttachments,
  uploadAttachment,
  deleteAttachment,
  downloadAttachment,
  type EntityType,
} from "../services/attachment.service";

export default function useAttachments(entityType: EntityType, entityId: string) {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const attachmentsQuery = useQuery({
    queryKey: ["attachments", entityType, entityId],
    queryFn: async () => {
      const { data, error } = await getAttachments(entityType, entityId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!entityId && !!entityType,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAttachment(entityType, entityId, file),
    onSuccess: (res) => {
      if (res.error) throw res.error;
      queryClient.invalidateQueries({ queryKey: ["attachments", entityType, entityId] });
      success("Attachment uploaded", "File has been successfully uploaded.");
    },
    onError: (err: Error) => errorToast("Upload failed", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: ({ id, storagePath }: { id: string; storagePath: string }) =>
      deleteAttachment(id, storagePath),
    onSuccess: (res) => {
      if (res.error) throw res.error;
      queryClient.invalidateQueries({ queryKey: ["attachments", entityType, entityId] });
      success("Attachment deleted", "File has been permanently deleted.");
    },
    onError: (err: Error) => errorToast("Failed to delete attachment", err.message),
  });

  return {
    attachments: attachmentsQuery.data ?? [],
    isLoading: attachmentsQuery.isLoading,
    uploadAttachment: uploadMutation.mutateAsync,
    deleteAttachment: deleteMutation.mutateAsync,
    downloadAttachment,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
