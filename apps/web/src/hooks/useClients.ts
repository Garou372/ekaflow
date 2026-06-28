import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "./useToast";
import type { Client, ClientNote, CreateClientNotePayload } from "../services/client.service";
import {
  createClient,
  createClientNote,
  deleteClient,
  deleteClientNote,
  getClientNotes,
  getClients,
  recordContactDate,
  setNextFollowUp,
  toggleFavorite,
  updateClient,
} from "../services/client.service";

export default function useClients() {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  // ── Clients ────────────────────────────────────────────────────────────────

  const clientsQuery = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await getClients();
      if (error) throw error;
      return data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      success("Client created", "New client has been added successfully.");
    },
    onError: (err: Error) => errorToast("Failed to create client", err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Client> }) =>
      updateClient(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      success("Client updated", "Changes have been saved.");
    },
    onError: (err: Error) => errorToast("Failed to update client", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClient,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["clients"] });
      const previousClients = queryClient.getQueryData<Client[]>(["clients"]);
      if (previousClients) {
        queryClient.setQueryData<Client[]>(
          ["clients"],
          previousClients.filter((c) => c.id !== id),
        );
      }
      return { previousClients };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previousClients) {
        queryClient.setQueryData(["clients"], context.previousClients);
      }
      errorToast("Failed to delete client", err.message);
    },
    onSuccess: () => success("Client deleted", "The client has been removed."),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  // ── CRM Actions ────────────────────────────────────────────────────────────

  const favoriteMutation = useMutation({
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      toggleFavorite(id, isFavorite),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
    onError: (err: Error) => errorToast("Failed to update favorite", err.message),
  });

  const followUpMutation = useMutation({
    mutationFn: ({ id, date }: { id: string; date: string | null }) =>
      setNextFollowUp(id, date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      success("Follow-up scheduled");
    },
    onError: (err: Error) => errorToast("Failed to schedule follow-up", err.message),
  });

  const contactedMutation = useMutation({
    mutationFn: (id: string) => recordContactDate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      success("Contact recorded", "Last contacted date updated.");
    },
    onError: (err: Error) => errorToast("Failed to record contact", err.message),
  });

  return {
    clients: clientsQuery.data ?? [],
    isLoading: clientsQuery.isLoading,
    error: clientsQuery.error,

    createClient: createMutation.mutateAsync,
    updateClient: updateMutation.mutateAsync,
    deleteClient: deleteMutation.mutateAsync,
    toggleFavorite: favoriteMutation.mutateAsync,
    scheduleFollowUp: followUpMutation.mutateAsync,
    recordContacted: contactedMutation.mutateAsync,

    creating: createMutation.isPending,
    updating: updateMutation.isPending,
    deleting: deleteMutation.isPending,
  };
}

// ── Client Notes Hook ──────────────────────────────────────────────────────────

export function useClientNotes(clientId: string | undefined) {
  const queryClient = useQueryClient();
  const { success, error: errorToast } = useToast();

  const notesQuery = useQuery({
    queryKey: ["client_notes", clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await getClientNotes(clientId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!clientId,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateClientNotePayload) => createClientNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["client_notes", clientId] });
      success("Note added");
    },
    onError: (err: Error) => errorToast("Failed to add note", err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClientNote(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["client_notes", clientId] });
      const previousNotes = queryClient.getQueryData<ClientNote[]>(["client_notes", clientId]);
      if (previousNotes) {
        queryClient.setQueryData<ClientNote[]>(
          ["client_notes", clientId],
          previousNotes.filter((n) => n.id !== id),
        );
      }
      return { previousNotes };
    },
    onError: (err: Error, _id, context) => {
      if (context?.previousNotes) {
        queryClient.setQueryData(["client_notes", clientId], context.previousNotes);
      }
      errorToast("Failed to delete note", err.message);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["client_notes", clientId] });
    },
  });

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    addNote: createMutation.mutateAsync,
    deleteNote: deleteMutation.mutateAsync,
    adding: createMutation.isPending,
  };
}
