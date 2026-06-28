import { useEffect } from "react";
import { X } from "lucide-react";
import type { Client } from "../../../services/client.service";
import type { Invoice } from "../../invoices/types/invoice";
import type { Proposal } from "../../../services/proposal.service";
import ClientTimeline from "./ClientTimeline";
import useProjects from "../../../hooks/useProjects";
import { useClientNotes } from "../../../hooks/useClients";

type ClientHistoryModalProps = {
  client: Client;
  invoices: Invoice[];
  proposals: Proposal[];
  onClose: () => void;
};

export default function ClientHistoryModal({
  client,
  invoices,
  proposals,
  onClose,
}: ClientHistoryModalProps) {
  // Keyboard accessibility
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const { projects: allProjects = [] } = useProjects();
  const { notes } = useClientNotes(client.id);

  const projects = allProjects.filter((p: any) => p.client_id === client.id);
  const clientInvoices = invoices.filter((i) => i.clientId === client.id);
  const clientProposals = proposals.filter((p) => p.client_id === client.id);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-history-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-white shadow-xl animate-in slide-in-from-right duration-300 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b p-5">
          <div>
            <h2 id="client-history-title" className="text-xl font-semibold">
              Client History
            </h2>
            <p className="text-sm text-gray-500">{client.name}</p>
          </div>
          <button
            type="button"
            aria-label="Close history"
            onClick={onClose}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <ClientTimeline 
            invoices={clientInvoices} 
            proposals={clientProposals} 
            projects={projects} 
            notes={notes} 
          />
        </div>
      </div>
    </div>
  );
}
