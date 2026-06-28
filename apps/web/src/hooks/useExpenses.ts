import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expense.service";
import type { CreateExpensePayload, Expense } from "../features/expenses/types/expense";

export default function useExpenses() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await getExpenses();
      if (error) throw error;
      return (data as Expense[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      success("Expense recorded", "New expense has been saved.");
    },
    onError: (err: Error) => errorToast("Failed to record expense", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateExpensePayload> }) =>
      updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      success("Expense updated", "Changes have been saved.");
    },
    onError: (err: Error) => errorToast("Failed to update expense", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["expenses"] });
      const previousExpenses = queryClient.getQueryData<Expense[]>(["expenses"]);
      if (previousExpenses) {
        queryClient.setQueryData<Expense[]>(
          ["expenses"],
          previousExpenses.filter((e) => e.id !== id)
        );
      }
      return { previousExpenses };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(["expenses"], context.previousExpenses);
      }
      errorToast("Failed to delete expense", err.message);
    },
    onSuccess: () => {
      success("Expense deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });

  return {
    expenses: data ?? [],
    isLoading,
    error,
    createExpense: createMutation.mutateAsync,
    updateExpense: updateMutation.mutateAsync,
    deleteExpense: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
