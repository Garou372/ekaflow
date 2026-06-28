import type { Proposal } from "../../../services/proposal.service";

type ProposalCardProps = {
  proposal: Proposal;
  clientName?: string;
  onEdit: (proposal: Proposal) => void;
  onDelete: (id: string) => void;
  onConvert?: (proposal: Proposal) => void;
};

export default function ProposalCard({
  proposal,
  clientName,
  onEdit,
  onDelete,
  onConvert,
}: ProposalCardProps) {
  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{proposal.title}</h3>

          <p className="mt-1 text-sm text-gray-500">
            {clientName ?? "Unknown Client"}
          </p>

          <span className="mt-3 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium capitalize">
            {proposal.status}
          </span>
        </div>

        <div className="text-right">
          <p className="text-xl font-bold">₹ {proposal.total.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={() => onEdit(proposal)}
          className="rounded-lg border px-4 py-2 hover:bg-gray-50"
        >
          Edit
        </button>

        <button
          onClick={() => onDelete(proposal.id)}
          className="rounded-lg border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50"
        >
          Delete
        </button>

        {onConvert && proposal.status === "accepted" && (
          <button
            onClick={() => onConvert(proposal)}
            className="ml-auto rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
          >
            Create Invoice
          </button>
        )}
      </div>
    </div>
  );
}
