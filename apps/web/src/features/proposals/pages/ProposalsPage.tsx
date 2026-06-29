import { useMemo, useState } from "react";
import { FileText, Plus, Search } from "lucide-react";

import PageHeader from "../../../components/common/PageHeader";
import ProposalForm from "../components/ProposalForm";
import ProposalCard from "../components/ProposalCard";
import InvoiceEditor from "../../invoices/components/InvoiceEditor";
import DeleteConfirmModal from "../../../components/common/DeleteConfirmModal";
import EmptyState from "../../../components/common/EmptyState";
import LoadingPage from "../../../components/common/LoadingPage";

import useProposals from "../../../hooks/useProposals";

import useClients from "../../../hooks/useClients";
import useInvoices from "../../../hooks/useInvoices";

import type {
  Proposal,
  CreateProposalPayload,
} from "../../../services/proposal.service";

import { proposalToInvoice } from "../../invoices/utils/proposalToInvoice";
import { getNextInvoiceNumber } from "../../invoices/utils/invoiceNumber";
import type { CreateInvoiceInput } from "../../invoices/types/invoice";

export default function ProposalsPage() {
  const {
    proposals,
    isLoading,
    createProposal,
    updateProposal,
    deleteProposal,
    creating,
    updating,
    deleting,
  } = useProposals();

  const { clients } = useClients();

  const {
    invoices,
    createInvoice,
    creating: creatingInvoice,
  } = useInvoices();

  const [open, setOpen] = useState(false);
  const [editingProposal, setEditingProposal] = useState<
    Proposal | undefined
  >();

  // Proposal being converted to an invoice
  const [convertingProposal, setConvertingProposal] = useState<
    Proposal | undefined
  >();

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return proposals.filter((proposal) =>
      proposal.title.toLowerCase().includes(search.toLowerCase()),
    );
  }, [proposals, search]);

  // Next invoice number is derived from the latest existing invoice
  const nextInvoiceNumber = useMemo(
    () => getNextInvoiceNumber(invoices[0]?.invoiceNumber),
    [invoices],
  );

  async function handleSubmit(payload: CreateProposalPayload) {
    if (editingProposal) {
      await updateProposal({
        id: editingProposal.id,
        payload,
      });
    } else {
      await createProposal(payload);
    }

    setEditingProposal(undefined);
    setOpen(false);
  }

  function handleEdit(proposal: Proposal) {
    setEditingProposal(proposal);
    setOpen(true);
  }

  function handleDelete(id: string) {
    setDeletingId(id);
  }

  async function confirmDelete() {
    if (!deletingId) return;
    try {
      await deleteProposal(deletingId);
    } finally {
      setDeletingId(null);
    }
  }

  function handleConvert(proposal: Proposal) {
    setConvertingProposal(proposal);
  }

  async function handleInvoiceSubmit(data: CreateInvoiceInput) {
    await createInvoice(data);
    setConvertingProposal(undefined);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Proposals" description="Create and manage client proposals.">
        <button
          onClick={() => {
            setEditingProposal(undefined);
            setOpen(true);
          }}
          className="ek-btn ek-btn-primary ek-btn-md"
        >
          <Plus size={16} />
          New Proposal
        </button>
      </PageHeader>

      {/* Search bar */}
      <div className="ek-search-wrap" style={{ maxWidth: 380 }}>
        <Search size={16} />
        <input
          type="search"
          placeholder="Search proposals…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ek-search-input"
        />
      </div>

      {isLoading ? (
        <LoadingPage />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title={search ? "No proposals found" : "No proposals yet"}
          description={
            search
              ? `No proposals match "${search}". Try a different search.`
              : "Create your first proposal to send to a client."
          }
          action={
            !search ? (
              <button
                onClick={() => { setEditingProposal(undefined); setOpen(true); }}
                className="ek-btn ek-btn-primary ek-btn-md"
              >
                <Plus size={15} />
                Create First Proposal
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              clientName={
                clients.find((c) => c.id === proposal.client_id)?.name
              }
              onEdit={handleEdit}
              onDelete={handleDelete}
              onConvert={handleConvert}
            />
          ))}
        </div>
      )}

      {open && (
        <ProposalForm
          clients={clients}
          isSubmitting={creating || updating}
          initialValues={
            editingProposal && {
              title: editingProposal.title,
              client_id: editingProposal.client_id,
              status: editingProposal.status,
              notes: editingProposal.notes ?? "",
              items: editingProposal.items,
              tax: editingProposal.tax,
              discount: editingProposal.discount,
            }
          }
          onSubmit={handleSubmit}
        />
      )}

      {/* Invoice editor pre-filled from the accepted proposal */}
      {convertingProposal && (
        <InvoiceEditor
          clients={clients}
          isSubmitting={creatingInvoice}
          nextInvoiceNumber={nextInvoiceNumber}
          conversionValues={proposalToInvoice(
            convertingProposal,
            nextInvoiceNumber,
          )}
          onSubmit={handleInvoiceSubmit}
          onClose={() => setConvertingProposal(undefined)}
        />
      )}

      {deletingId && (
        <DeleteConfirmModal
          title="Delete Proposal"
          description="Are you sure you want to delete this proposal? This action cannot be undone."
          isDeleting={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
