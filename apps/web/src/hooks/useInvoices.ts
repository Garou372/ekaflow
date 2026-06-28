import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  updateInvoice,
} from "../services/invoice.service";

import type {
  CreateInvoiceInput,
} from "../features/invoices/types/invoice";

import type { InvoiceStatus } from "../features/invoices/types/invoice";

export default function useInvoices() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const { data, error } = await getInvoices();

      if (error) throw error;

      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateInvoiceInput) => createInvoice(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateInvoiceInput>;
    }) => updateInvoice(id, payload),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });
    },
  });

  // Dedicated status-only mutation — lighter than updateInvoice (no full form payload)
  // and has its own loading flag so the card can show a spinner independently.
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoice(id, { status }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });
    },
  });

  return {
    invoices: data ?? [],
    isLoading,
    error,

    createInvoice: createMutation.mutateAsync,
    updateInvoice: updateMutation.mutateAsync,
    deleteInvoice: deleteMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,

    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
    updatingStatus: updateStatusMutation.isPending,
  };
}
