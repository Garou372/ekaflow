import type { UseFormRegister, FieldErrors } from "react-hook-form";
import type { ProposalStatus } from "../../../services/proposal.service";
import AIAssistantPanel from "../../ai/components/AIAssistantPanel";

export type ProposalDetailsForm = {
  title: string;
  client_id: string;
  status: ProposalStatus;
  notes: string;
};

type ProposalDetailsProps = {
  register: UseFormRegister<ProposalDetailsForm>;
  errors: FieldErrors<ProposalDetailsForm>;
  clients: {
    id: string;
    name: string;
  }[];
  onInsertNotes?: (text: string) => void;
};

export default function ProposalDetails({
  register,
  errors,
  clients,
  onInsertNotes,
}: ProposalDetailsProps) {
  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
      <h2 className="text-lg font-semibold">Proposal Details</h2>

      <div className="space-y-2">
        <label className="text-sm font-medium">Proposal Title</label>

        <input
          {...register("title")}
          placeholder="Website Development Proposal"
          className="w-full rounded-lg border px-3 py-2"
        />

        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Client</label>

          <select
            {...register("client_id")}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="">Select Client</option>

            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          {errors.client_id && (
            <p className="text-sm text-red-500">{errors.client_id.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>

          <select
            {...register("status")}
            className="w-full rounded-lg border px-3 py-2"
          >
            <option value="draft">Draft</option>

            <option value="sent">Sent</option>

            <option value="accepted">Accepted</option>

            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes & Overview</label>
          <textarea
            rows={5}
            {...register("notes")}
            placeholder="Describe the proposal, deliverables, or add any notes for the client..."
            className="w-full rounded-lg border px-3 py-2"
          />
        </div>

        {onInsertNotes && (
          <AIAssistantPanel
            compact={true}
            defaultTask="improve_proposal"
            onInsert={onInsertNotes}
          />
        )}
      </div>
    </div>
  );
}
