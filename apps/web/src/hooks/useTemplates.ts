import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  type TemplateType,
  type CreateTemplatePayload,
  type Template,
} from "../services/template.service";

export default function useTemplates(type?: TemplateType) {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const templatesQuery = useQuery({
    queryKey: ["templates", type],
    queryFn: async () => {
      const { data, error } = await getTemplates(type);
      if (error) throw error;
      return (data as Template[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTemplatePayload) => createTemplate(payload),
    onSuccess: (res) => {
      if (res.error) throw res.error;
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      success("Template created", "New template has been saved.");
    },
    onError: (err: Error) => errorToast("Failed to create template", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateTemplatePayload> }) =>
      updateTemplate(id, payload),
    onSuccess: (res) => {
      if (res.error) throw res.error;
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      success("Template updated", "Changes have been saved.");
    },
    onError: (err: Error) => errorToast("Failed to update template", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: (res) => {
      if (res.error) throw res.error;
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      success("Template deleted", "Template has been removed.");
    },
    onError: (err: Error) => errorToast("Failed to delete template", err.message),
  });

  return {
    templates: templatesQuery.data ?? [],
    isLoading: templatesQuery.isLoading,
    createTemplate: createMutation.mutateAsync,
    updateTemplate: updateMutation.mutateAsync,
    deleteTemplate: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
