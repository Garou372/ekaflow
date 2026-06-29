import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project.service";
import type {
  CreateProjectPayload,
  Project,
} from "../features/projects/types/project";

// ─── Query Keys ───────────────────────────────────────────────────────────────
const KEYS = {
  all: ["projects"] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export default function useProjects() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: KEYS.all,
    queryFn: async () => {
      const { data, error } = await getProjects();
      if (error) throw error;
      return (data as Project[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      success("Project created", "New project has been added.");
    },
    onError: (err: Error) =>
      errorToast("Failed to create project", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateProjectPayload>;
    }) => updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
      success("Project updated", "Changes have been saved.");
    },
    onError: (err: Error) =>
      errorToast("Failed to update project", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: KEYS.all });
      const previousProjects = queryClient.getQueryData<Project[]>(KEYS.all);
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          KEYS.all,
          previousProjects.filter((p) => p.id !== id),
        );
      }
      return { previousProjects };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(KEYS.all, context.previousProjects);
      }
      errorToast("Failed to delete project", err.message);
    },
    onSuccess: () => {
      success("Project deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.all });
    },
  });

  return {
    projects: data ?? [],
    isLoading,
    error,
    createProject: createMutation.mutateAsync,
    updateProject: updateMutation.mutateAsync,
    deleteProject: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
