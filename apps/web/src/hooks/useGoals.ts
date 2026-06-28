import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoal,
  type CreateGoalPayload,
  type Goal,
} from "../services/goals.service";

export default function useGoals() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const goalsQuery = useQuery({
    queryKey: ["goals"],
    queryFn: async () => {
      const { data, error } = await getGoals();
      if (error) throw error;
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateGoalPayload) => createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      success("Goal created", "Your new goal has been set.");
    },
    onError: (err: Error) => errorToast("Failed to create goal", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateGoalPayload> }) =>
      updateGoal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      success("Goal updated");
    },
    onError: (err: Error) => errorToast("Failed to update goal", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGoal(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["goals"] });
      const previousGoals = queryClient.getQueryData<Goal[]>(["goals"]);
      if (previousGoals) {
        queryClient.setQueryData<Goal[]>(["goals"], previousGoals.filter((g) => g.id !== id));
      }
      return { previousGoals };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previousGoals) {
        queryClient.setQueryData(["goals"], context.previousGoals);
      }
      errorToast("Failed to delete goal", err.message);
    },
    onSuccess: () => success("Goal deleted"),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["goals"] }),
  });

  return {
    goals: goalsQuery.data ?? [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal: createMutation.mutateAsync,
    updateGoal: updateMutation.mutateAsync,
    deleteGoal: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
