import { useMemo, useState } from "react";

import PageHeader from "../../../components/common/PageHeader";
import ProposalForm from "../components/ProposalForm";
import ProposalCard from "../components/ProposalCard";
import InvoiceEditor from "../../invoices/components/InvoiceEditor";

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

  async function handleDelete(id: string) {
    if (!confirm("Delete proposal?")) return;

    await deleteProposal(id);
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
      <PageHeader title="Proposals" description="Create and manage proposals.">
        <button
          onClick={() => {
            setEditingProposal(undefined);
            setOpen(true);
          }}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
        >
          + New Proposal
        </button>
      </PageHeader>

      <input
        placeholder="Search proposal..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border px-4 py-2"
      />

      {isLoading ? (
        <div className="py-10 text-center">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <h2 className="text-xl font-semibold">No Proposals</h2>

          <p className="mt-2 text-gray-500">Create your first proposal.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
    </div>
  );
}
