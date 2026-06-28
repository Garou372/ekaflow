import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from "../services/project.service";
import type { CreateProjectPayload, Project } from "../features/projects/types/project";

export default function useProjects() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data, error } = await getProjects();
      if (error) throw error;
      return (data as Project[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProjectPayload) => createProject(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
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
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["projects"] });
      const previousProjects = queryClient.getQueryData<Project[]>(["projects"]);
      if (previousProjects) {
        queryClient.setQueryData<Project[]>(
          ["projects"],
          previousProjects.filter((p) => p.id !== id)
        );
      }
      return { previousProjects };
    },
    onError: (err, id, context) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["projects"], context.previousProjects);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
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
