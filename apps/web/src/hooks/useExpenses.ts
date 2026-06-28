import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "../services/expense.service";
import type { CreateExpensePayload, Expense } from "../features/expenses/types/expense";

export default function useExpenses() {
  const queryClient = useQueryClient();

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
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateExpensePayload>;
    }) => updateExpense(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
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
    onError: (err, id, context) => {
      if (context?.previousExpenses) {
        queryClient.setQueryData(["expenses"], context.previousExpenses);
      }
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
