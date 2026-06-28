import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";

import {
  createInvoice,
  deleteInvoice,
  getInvoices,
  updateInvoice,
} from "../services/invoice.service";

import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceStatus,
} from "../features/invoices/types/invoice";

export default function useInvoices() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

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
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      success("Invoice created", "New invoice has been saved.");
    },
    onError: (err: Error) => errorToast("Failed to create invoice", err.message),
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
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      success("Invoice updated", "Changes have been saved.");
    },
    onError: (err: Error) => errorToast("Failed to update invoice", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteInvoice(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["invoices"] });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(["invoices"]);
      if (previousInvoices) {
        queryClient.setQueryData<Invoice[]>(
          ["invoices"],
          previousInvoices.filter((inv) => inv.id !== id)
        );
      }
      return { previousInvoices };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(["invoices"], context.previousInvoices);
      }
      errorToast("Failed to delete invoice", err.message);
    },
    onSuccess: () => {
      success("Invoice deleted");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoice(id, { status }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ["invoices"] });
      const previousInvoices = queryClient.getQueryData<Invoice[]>(["invoices"]);
      if (previousInvoices) {
        queryClient.setQueryData<Invoice[]>(
          ["invoices"],
          previousInvoices.map((inv) =>
            inv.id === id ? { ...inv, status } : inv
          )
        );
      }
      return { previousInvoices };
    },
    onError: (err: Error, _v, context) => {
      if (context?.previousInvoices) {
        queryClient.setQueryData(["invoices"], context.previousInvoices);
      }
      errorToast("Failed to update status", err.message);
    },
    onSuccess: (_data, { status }) => {
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      success("Status updated", `Invoice marked as ${statusLabel}.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
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
