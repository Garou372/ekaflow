import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import {
  createProposal,
  deleteProposal,
  getProposals,
  updateProposal,
  type CreateProposalPayload,
} from "../services/proposal.service";

export default function useProposals() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const { data, isLoading, error } = useQuery({
    queryKey: ["proposals"],
    queryFn: async () => {
      const { data, error } = await getProposals();
      if (error) throw error;
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateProposalPayload) => createProposal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      success("Proposal created", "New proposal has been saved as draft.");
    },
    onError: (err: Error) => errorToast("Failed to create proposal", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateProposalPayload>;
    }) => updateProposal(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      success("Proposal updated", "Changes have been saved.");
    },
    onError: (err: Error) => errorToast("Failed to update proposal", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProposal(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      success("Proposal deleted");
    },
    onError: (err: Error) => errorToast("Failed to delete proposal", err.message),
  });

  return {
    proposals: data ?? [],
    isLoading,
    error,
    createProposal: createMutation.mutateAsync,
    updateProposal: updateMutation.mutateAsync,
    deleteProposal: deleteMutation.mutateAsync,
    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}
