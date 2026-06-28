import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRecurringInvoices,
  createRecurringInvoice,
  updateRecurringInvoiceStatus,
  processDueRecurringInvoice,
} from "../services/recurring.service";
import type { CreateRecurringInvoicePayload, RecurringInvoice } from "../features/invoices/types/recurring";

export default function useRecurringInvoices() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["recurring_invoices"],
    queryFn: getRecurringInvoices,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateRecurringInvoicePayload) => createRecurringInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_invoices"] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: RecurringInvoice["status"] }) =>
      updateRecurringInvoiceStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_invoices"] });
    },
  });

  const processMutation = useMutation({
    mutationFn: ({
      id,
      newNextRunDate,
      currentRunDate,
    }: {
      id: string;
      newNextRunDate: string;
      currentRunDate: string;
    }) => processDueRecurringInvoice(id, newNextRunDate, currentRunDate),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recurring_invoices"] });
    },
  });

  return {
    recurringInvoices: data ?? [],
    isLoading,
    error,
    createRecurringInvoice: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutateAsync,
    processRecurring: processMutation.mutateAsync,
  };
}
