import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from "../services/time.service";
import type { CreateTimeEntryPayload, UpdateTimeEntryPayload, TimeEntry } from "../features/time/types/time";

export default function useTimeEntries() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["time_entries"],
    queryFn: async () => {
      const { data, error } = await getTimeEntries();
      if (error) throw error;
      return (data as TimeEntry[]) ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateTimeEntryPayload) => createTimeEntry(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateTimeEntryPayload;
    }) => updateTimeEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTimeEntry(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["time_entries"] });
      const previousEntries = queryClient.getQueryData<TimeEntry[]>(["time_entries"]);
      if (previousEntries) {
        queryClient.setQueryData<TimeEntry[]>(
          ["time_entries"],
          previousEntries.filter((e) => e.id !== id)
        );
      }
      return { previousEntries };
    },
    onError: (err, id, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["time_entries"], context.previousEntries);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
    },
  });

  return {
    timeEntries: data ?? [],
    isLoading,
    error,
    createTimeEntry: createMutation.mutateAsync,
    updateTimeEntry: updateMutation.mutateAsync,
    deleteTimeEntry: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
