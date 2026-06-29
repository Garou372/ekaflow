import { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, FileCheck, User } from "lucide-react";

import useClients from "../../hooks/useClients";
import useInvoices from "../../hooks/useInvoices";
import useProposals from "../../hooks/useProposals";

// ─── Types ────────────────────────────────────────────────────────

type SearchResult = {
  id: string;
  type: "client" | "invoice" | "proposal";
  title: string;
  subtitle: string;
  link: string;
};

const TYPE_STYLES = {
  invoice: {
    bg: "var(--ek-primary-50)",
    color: "var(--ek-primary)",
    icon: FileText,
    label: "Invoice",
  },
  proposal: {
    bg: "#F0FDF4",
    color: "#16A34A",
    icon: FileCheck,
    label: "Proposal",
  },
  client: {
    bg: "#EFF6FF",
    color: "#2563EB",
    icon: User,
    label: "Client",
  },
} as const;

// ─── Component ────────────────────────────────────────────────────

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

    invoices.forEach((invoice) => {
      const clientName =
        clients.find((c) => c.id === invoice.clientId)?.name ?? "";
      if (
        invoice.invoiceNumber.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q)
      ) {
        matched.push({
          id: `invoice-${invoice.id}`,
          type: "invoice",
          title: invoice.invoiceNumber,
          subtitle: `Invoice · ${clientName}`,
          link: "/invoices",
        });
      }
    });

    proposals.forEach((proposal) => {
      const clientName =
        clients.find((c) => c.id === proposal.client_id)?.name ?? "";
      if (
        proposal.title.toLowerCase().includes(q) ||
        clientName.toLowerCase().includes(q)
      ) {
        matched.push({
          id: `proposal-${proposal.id}`,
          type: "proposal",
          title: proposal.title,
          subtitle: `Proposal · ${clientName}`,
          link: "/proposals",
        });
      }
    });

    return matched.slice(0, 8);
  }, [query, clients, invoices, proposals]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
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
    <div className="relative w-full" ref={containerRef}>
      {/* Search input */}
      <div className="ek-search-wrap">
        <Search size={16} aria-hidden="true" />
        <input
          type="search"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-label="Search clients, invoices, proposals"
          placeholder="Search… (Ctrl+K)"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="ek-search-input"
        />
      </div>

      {/* Results dropdown */}
      {isOpen && query.trim() !== "" && (
        <div
          className="ek-dropdown absolute top-full left-0 right-0 mt-2 overflow-hidden"
          style={{ zIndex: 60 }}
          role="listbox"
          aria-label="Search results"
        >
          {results.length === 0 ? (
            <div
              className="flex flex-col items-center py-8"
              style={{ fontSize: 13, color: "var(--ek-text-tertiary)" }}
            >
              <Search size={20} style={{ opacity: 0.4, marginBottom: 8 }} />
              No results for "<strong>{query}</strong>"
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto p-1.5">
              {results.map((result) => {
                const ts = TYPE_STYLES[result.type];
                const Icon = ts.icon;

                return (
                  <li key={result.id}>
                    <button
                      role="option"
                      aria-selected={false}
                      onClick={() => handleSelect(result.link)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors"
                      style={{}}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "var(--ek-bg-base)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.background =
                          "transparent";
                      }}
                    >
                      {/* Type icon */}
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: ts.bg, color: ts.color }}
                      >
                        <Icon size={14} strokeWidth={2} />
                      </div>

                      {/* Text */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate font-semibold"
                          style={{ fontSize: 13, color: "var(--ek-text-primary)" }}
                        >
                          {result.title}
                        </p>
                        <p
                          className="truncate"
                          style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}
                        >
                          {result.subtitle}
                        </p>
                      </div>

                      {/* Type label chip */}
                      <span
                        className="shrink-0"
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          padding: "2px 7px",
                          borderRadius: 6,
                          background: ts.bg,
                          color: ts.color,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {ts.label}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
