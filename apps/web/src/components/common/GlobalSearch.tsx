import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, FileCheck, User } from "lucide-react";

import useClients from "../../hooks/useClients";
import useInvoices from "../../hooks/useInvoices";
import useProposals from "../../hooks/useProposals";

type SearchResult = {
  id: string;
  type: "client" | "invoice" | "proposal";
  title: string;
  subtitle: string;
  link: string;
};

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { clients } = useClients();
  const { invoices } = useInvoices();
  const { proposals } = useProposals();

  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    const matched: SearchResult[] = [];

    // Match clients
    clients.forEach((client) => {
      if (
        client.name.toLowerCase().includes(q) ||
        client.company?.toLowerCase().includes(q)
      ) {
        matched.push({
          id: `client-${client.id}`,
          type: "client",
          title: client.name,
          subtitle: client.company || "Client",
          link: "/clients",
        });
      }
    });

    // Match invoices
    invoices.forEach((invoice) => {
      const clientName = clients.find((c) => c.id === invoice.clientId)?.name ?? "";
      if (
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q)
      ) {
        matched.push({
          id: `invoice-${invoice.id}`,
          type: "invoice",
          title: invoice.invoiceNumber,
          subtitle: `Invoice for ${clientName}`,
          link: "/invoices",
        });
      }
    });

    // Match proposals
    proposals.forEach((proposal) => {
      const clientName = clients.find((c) => c.id === proposal.client_id)?.name ?? "";
      if (
        proposal.title.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q)
      ) {
        matched.push({
          id: `proposal-${proposal.id}`,
          type: "proposal",
          title: proposal.title,
          subtitle: `Proposal for ${clientName}`,
          link: "/proposals",
        });
      }
    });

    return matched.slice(0, 8); // Limit to top 8 results
  }, [query, clients, invoices, proposals]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(link: string) {
    navigate(link);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search clients, invoices, proposals..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {isOpen && query.trim() !== "" && (
        <div className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border bg-white shadow-xl">
          {results.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}"
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto">
              {results.map((result) => (
                <li key={result.id}>
                  <button
                    onClick={() => handleSelect(result.link)}
                    className="flex w-full items-center gap-3 border-b border-gray-50 p-3 text-left hover:bg-gray-50 last:border-0"
                  >
                    <div
                      className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        result.type === "invoice"
                          ? "bg-indigo-100 text-indigo-600"
                          : result.type === "proposal"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {result.type === "invoice" && <FileText size={14} />}
                      {result.type === "proposal" && <FileCheck size={14} />}
                      {result.type === "client" && <User size={14} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {result.title}
                      </p>
                      <p className="truncate text-xs text-gray-500">
                        {result.subtitle}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
