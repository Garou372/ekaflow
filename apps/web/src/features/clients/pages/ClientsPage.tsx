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
import UsageLimitGuard from "../../../components/common/UsageLimitGuard";
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
        <UsageLimitGuard
          action="create_client"
          onProceed={() => {
            setEditingClient(undefined);
            setOpen(true);
          }}
        >
          {({ onClick }) => (
            <button
              onClick={onClick}
              className="ek-btn ek-btn-primary ek-btn-md"
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span>
              New Client
            </button>
          )}
        </UsageLimitGuard>
      </PageHeader>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="ek-skeleton h-52 rounded-2xl" />
          ))}
        </div>
      ) : (
        <>
          {/* CRM Summary Chips */}
      {clients.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="ek-chip">
            <span style={{ fontWeight: 700, color: "var(--ek-text-primary)" }}>{clients.length}</span>
            Total
          </span>
          {vipCount > 0 && (
            <span className="ek-chip" style={{ background: "#FFFBEB", color: "#D97706", borderColor: "#FDE68A" }}>
              <span style={{ fontWeight: 700 }}>{vipCount}</span> VIP
            </span>
          )}
          {followUpDue > 0 && (
            <span className="ek-chip ek-status-overdue">
              <span style={{ fontWeight: 700 }}>{followUpDue}</span> Follow-ups due
            </span>
          )}
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="ek-search-wrap flex-1 min-w-[220px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="search"
            placeholder="Search by name, email, company or tag…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ek-search-input"
          />
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5">
          <Filter size={14} style={{ color: "var(--ek-text-tertiary)", flexShrink: 0 }} />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="ek-select"
            style={{ minWidth: 130 }}
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
          className="ek-select"
          style={{ minWidth: 140 }}
        >
          <option value="priority">Sort: Priority</option>
          <option value="name">Sort: Name</option>
          <option value="revenue">Sort: Revenue</option>
          <option value="follow_up">Sort: Follow-up</option>
        </select>

        {/* Favorites toggle */}
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className="ek-btn"
          style={{
            padding: "8px 14px",
            background: showFavoritesOnly ? "#FFFBEB" : "var(--ek-bg-surface)",
            border: showFavoritesOnly ? "1.5px solid #FDE68A" : "1.5px solid var(--ek-border)",
            color: showFavoritesOnly ? "#D97706" : "var(--ek-text-secondary)",
            borderRadius: "var(--ek-radius-md)",
          }}
        >
          <Star size={14} style={showFavoritesOnly ? { fill: "#FBBF24", color: "#FBBF24" } : undefined} />
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
            <UsageLimitGuard
              action="create_client"
              onProceed={() => setOpen(true)}
            >
              {({ onClick }) => (
                <button
                  onClick={onClick}
                  className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
                >
                  Add Client
                </button>
              )}
            </UsageLimitGuard>
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
