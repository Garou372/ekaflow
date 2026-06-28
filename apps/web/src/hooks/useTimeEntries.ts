import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  getTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
} from "../services/time.service";
import type {
  CreateTimeEntryPayload,
  UpdateTimeEntryPayload,
  TimeEntry,
} from "../features/time/types/time";

export default function useTimeEntries() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

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
      success("Time logged", "Time entry has been saved.");
    },
    onError: (err: Error) => errorToast("Failed to log time", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTimeEntryPayload }) =>
      updateTimeEntry(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["time_entries"] });
    },
    onError: (err: Error) => errorToast("Failed to update time entry", err.message),
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
    onError: (err: Error, _id, context) => {
      if (context?.previousEntries) {
        queryClient.setQueryData(["time_entries"], context.previousEntries);
      }
      errorToast("Failed to delete time entry", err.message);
    },
    onSuccess: () => success("Time entry deleted"),
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
