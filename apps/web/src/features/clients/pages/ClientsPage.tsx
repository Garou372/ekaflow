import { useMemo, useState } from "react";
import { Star, Filter, Users } from "lucide-react";

import PageHeader from "../../../components/common/PageHeader";
import useClients from "../../../hooks/useClients";
import type { Client } from "../../../services/client.service";
import type { ClientPriority } from "../../../services/client.service";

import ClientCard from "../components/ClientCard";
import ClientForm from "../components/ClientForm";
import ClientHistoryModal from "../components/ClientHistoryModal";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import type { ClientFormData } from "../components/ClientForm";

import useInvoices from "../../../hooks/useInvoices";
import useProposals from "../../../hooks/useProposals";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";

type SortOption = "name" | "priority" | "revenue" | "follow_up";
type PriorityFilter = "all" | ClientPriority;

export default function ClientsPage() {
  const {
    clients,
    isLoading,
    createClient,
    updateClient,
    deleteClient,
    toggleFavorite,
    creating,
    updating,
    deleting,
  } = useClients();

  const { invoices } = useInvoices();
  const { proposals } = useProposals();

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>();
  const [viewingHistoryFor, setViewingHistoryFor] = useState<Client | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered + sorted clients
  const filteredClients = useMemo(() => {
    let result = [...clients];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.tags?.some((t: string) => t.toLowerCase().includes(q)),
      );
    }

    // Priority filter
    if (priorityFilter !== "all") {
      result = result.filter((c) => (c.priority ?? "normal") === priorityFilter);
    }

    // Favorites filter
    if (showFavoritesOnly) {
      result = result.filter((c) => c.is_favorite);
    }

    // Sort
    const PRIORITY_ORDER: Record<ClientPriority, number> = { vip: 0, high: 1, normal: 2, low: 3 };
    result.sort((a, b) => {
      if (sortBy === "priority") {
        return (
          PRIORITY_ORDER[(a.priority ?? "normal") as ClientPriority] -
          PRIORITY_ORDER[(b.priority ?? "normal") as ClientPriority]
        );
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "follow_up") {
        const aDate = a.next_follow_up_at ? new Date(a.next_follow_up_at).getTime() : Infinity;
        const bDate = b.next_follow_up_at ? new Date(b.next_follow_up_at).getTime() : Infinity;
        return aDate - bDate;
      }
      if (sortBy === "revenue") {
        const aRev = invoices
          .filter((inv) => inv.clientId === a.id && inv.status === "paid")
          .reduce((s, inv) => s + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total, 0);
        const bRev = invoices
          .filter((inv) => inv.clientId === b.id && inv.status === "paid")
          .reduce((s, inv) => s + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total, 0);
        return bRev - aRev;
      }
      return 0;
    });

    return result;
  }, [clients, search, sortBy, priorityFilter, showFavoritesOnly, invoices]);

  async function handleSubmit(data: ClientFormData) {
    if (editingClient?.id) {
      await updateClient({ id: editingClient.id, payload: data });
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

  // Summary metrics
  const vipCount = clients.filter((c) => c.priority === "vip").length;
  const followUpDue = clients.filter((c) => {
    if (!c.next_follow_up_at) return false;
    return new Date(c.next_follow_up_at) <= new Date();
  }).length;

  return (
    <div className="space-y-6">
      <PageHeader title="Clients" description="Manage your client relationships">
        <button
          onClick={() => {
            setEditingClient(undefined);
            setOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + New Client
        </button>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-gray-100 animate-pulse border" />
          ))}
        </div>
      ) : (
        <>
          {/* CRM Summary Chips */}
      {clients.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border bg-white px-3 py-1.5 text-gray-600">
            <span className="font-semibold text-gray-900">{clients.length}</span> Total
          </span>
          {vipCount > 0 && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
              <span className="font-semibold">{vipCount}</span> VIP
            </span>
          )}
          {followUpDue > 0 && (
            <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-red-600">
              <span className="font-semibold">{followUpDue}</span> Follow-ups due
            </span>
          )}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          placeholder="Search by name, email, company, or tag..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        {/* Priority filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={15} className="text-gray-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
          >
            <option value="all">All Priority</option>
            <option value="vip">VIP</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="priority">Sort: Priority</option>
          <option value="name">Sort: Name</option>
          <option value="revenue">Sort: Revenue</option>
          <option value="follow_up">Sort: Follow-up</option>
        </select>

        {/* Favorites toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            showFavoritesOnly
              ? "border-amber-300 bg-amber-50 text-amber-700"
              : "border-gray-300 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Star size={14} className={showFavoritesOnly ? "fill-amber-400 text-amber-400" : ""} />
          Favorites
        </button>
      </div>

      {/* Client Grid */}
      {isLoading ? (
        // Skeleton
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-xl border bg-gray-100" />
          ))}
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed p-12 text-center">
          <Users size={40} className="mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900">
            {clients.length === 0 ? "No Clients Yet" : "No Clients Match"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {clients.length === 0
              ? "Add your first client to start managing relationships."
              : "Try adjusting your search or filters."}
          </p>
          {clients.length === 0 && (
            <button
              onClick={() => setOpen(true)}
              className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
            >
              Add Client
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredClients.map((client) => (
            <ClientCard
              key={client.id}
              client={client}
              invoices={invoices}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewHistory={setViewingHistoryFor}
              onToggleFavorite={(id, isFav) => toggleFavorite({ id, isFavorite: isFav })}
            />
          ))}
        </div>
      )}

        </>
      )}

      {/* Modals */}
      {open && (
        <ClientForm
          initialData={
            editingClient && {
              ...editingClient,
              // Format follow-up date for input
              next_follow_up_at: editingClient.next_follow_up_at?.split("T")[0],
            }
          }
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
