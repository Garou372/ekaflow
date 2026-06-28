import { useMemo, useState } from "react";

import PageHeader from "../../../components/common/PageHeader";
import useClients from "../../../hooks/useClients";
import type { Client } from "../../../services/client.service";

import ClientCard from "../components/ClientCard";
import ClientForm from "../components/ClientForm";
import ClientHistoryModal from "../components/ClientHistoryModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import type { ClientFormData } from "../components/ClientForm";

import useInvoices from "../../../hooks/useInvoices";
import useProposals from "../../../hooks/useProposals";

export default function ClientsPage() {
  const {
    clients,
    isLoading,
    createClient,
    deleteClient,
    creating,
    updating,
    deleting,
  } = useClients();

  const { invoices } = useInvoices();
  const { proposals } = useProposals();

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);

  const [editingClient, setEditingClient] = useState<Client | undefined>();

  const [viewingHistoryFor, setViewingHistoryFor] = useState<Client | undefined>();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const q = search.toLowerCase();

      return (
        client.name.toLowerCase().includes(q) ||
        client.email.toLowerCase().includes(q) ||
        client.company?.toLowerCase().includes(q)
      );
    });
  }, [clients, search]);

  async function handleSubmit(data: ClientFormData) {
    if (editingClient?.id) {
      await updateClient({
        id: editingClient.id,
        payload: data,
      });
    } else {
      await createClient(data);
    }

    setEditingClient(undefined);
    setOpen(false);
  }

  function handleEdit(client: Client) {
    setEditingClient(client);
    setOpen(true);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await deleteClient(deletingId);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Manage your clients">
        <button
          onClick={() => {
            setEditingClient(undefined);
            setOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + New Client
        </button>
      </PageHeader>

      <input
        placeholder="Search clients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-2"
      />

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : filteredClients.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <h3 className="text-xl font-semibold">No Clients Found</h3>

          <p className="mt-2 text-gray-500">Add your first client to begin.</p>

          <button
            onClick={() => setOpen(true)}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-white"
          >
            Add Client
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewHistory={setViewingHistoryFor}
            />
          ))}
        </div>
      )}

      {open && (
        <ClientForm
          initialData={editingClient}
          onClose={() => {
            setOpen(false);
            setEditingClient(undefined);
          }}
          onSubmit={handleSubmit}
          isSubmitting={creating || updating}
        />
      )}

      {viewingHistoryFor && (
        <ClientHistoryModal
          client={viewingHistoryFor}
          invoices={invoices}
          proposals={proposals}
          onClose={() => setViewingHistoryFor(undefined)}
        />
      )}

      {deletingId && (
        <DeleteConfirmModal
          title="Delete Client"
          description="Are you sure you want to delete this client? This will remove all their data."
          isDeleting={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
