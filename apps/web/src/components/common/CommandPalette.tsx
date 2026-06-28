import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Users, Folder, Calendar, Clock, DollarSign, Settings, Mail, Target, Command, Plus } from "lucide-react";
import useClients from "../../hooks/useClients";
import useProjects from "../../hooks/useProjects";
import useInvoices from "../../hooks/useInvoices";
import useProposals from "../../hooks/useProposals";

type Action = {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  perform: () => void;
  section: string;
};

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const { clients } = useClients();
  const { projects } = useProjects();
  const { invoices } = useInvoices();
  const { proposals } = useProposals();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  const navActions: Action[] = [
    { id: "nav-dash", title: "Dashboard", section: "Navigation", icon: <Command size={16} />, perform: () => navigate("/") },
    { id: "nav-insights", title: "Insights", section: "Navigation", icon: <Command size={16} />, perform: () => navigate("/insights") },
    { id: "nav-clients", title: "Clients", section: "Navigation", icon: <Users size={16} />, perform: () => navigate("/clients") },
    { id: "nav-projects", title: "Projects", section: "Navigation", icon: <Folder size={16} />, perform: () => navigate("/projects") },
    { id: "nav-proposals", title: "Proposals", section: "Navigation", icon: <FileText size={16} />, perform: () => navigate("/proposals") },
    { id: "nav-calendar", title: "Calendar", section: "Navigation", icon: <Calendar size={16} />, perform: () => navigate("/calendar") },
    { id: "nav-time", title: "Time Tracking", section: "Navigation", icon: <Clock size={16} />, perform: () => navigate("/time") },
    { id: "nav-invoices", title: "Invoices", section: "Navigation", icon: <DollarSign size={16} />, perform: () => navigate("/invoices") },
    { id: "nav-expenses", title: "Expenses", section: "Navigation", icon: <DollarSign size={16} />, perform: () => navigate("/expenses") },
    { id: "nav-followup", title: "Follow-ups", section: "Navigation", icon: <Mail size={16} />, perform: () => navigate("/followup") },
    { id: "nav-goals", title: "Goals", section: "Navigation", icon: <Target size={16} />, perform: () => navigate("/goals") },
    { id: "nav-settings", title: "Settings", section: "Navigation", icon: <Settings size={16} />, perform: () => navigate("/settings") },
  ];

  const quickActions: Action[] = [
    { id: "quick-invoice", title: "Create New Invoice", section: "Quick Actions", icon: <Plus size={16} />, perform: () => navigate("/invoices") },
    { id: "quick-proposal", title: "Create New Proposal", section: "Quick Actions", icon: <Plus size={16} />, perform: () => navigate("/proposals") },
    { id: "quick-client", title: "Add New Client", section: "Quick Actions", icon: <Plus size={16} />, perform: () => navigate("/clients") },
  ];

  const dataActions: Action[] = [
    ...clients.map(c => ({
      id: `client-${c.id}`,
      title: c.name,
      subtitle: c.company || "Client",
      section: "Clients",
      icon: <Users size={16} />,
      perform: () => navigate("/clients")
    })),
    ...projects.map(p => ({
      id: `proj-${p.id}`,
      title: p.name,
      subtitle: clients.find(c => c.id === p.client_id)?.name,
      section: "Projects",
      icon: <Folder size={16} />,
      perform: () => navigate("/projects")
    })),
    ...invoices.map(i => ({
      id: `inv-${i.id}`,
      title: i.invoiceNumber,
      subtitle: clients.find(c => c.id === i.clientId)?.name,
      section: "Invoices",
      icon: <DollarSign size={16} />,
      perform: () => navigate("/invoices")
    })),
    ...proposals.map(p => ({
      id: `prop-${p.id}`,
      title: p.title,
      subtitle: clients.find(c => c.id === p.client_id)?.name,
      section: "Proposals",
      icon: <FileText size={16} />,
      perform: () => navigate("/proposals")
    }))
  ];

  const allActions = [...quickActions, ...navActions, ...dataActions];

  const fuzzyMatch = (str: string, pattern: string) => {
    pattern = pattern.split("").reduce((a, b) => a + ".*" + b, "");
    return new RegExp(pattern, "i").test(str);
  };

  const filteredActions = allActions.filter((action) =>
    fuzzyMatch(action.title + (action.subtitle || ""), query)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] bg-black/40 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    >
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center px-4 border-b">
          <Search size={20} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full px-4 py-4 text-base bg-transparent border-0 outline-none placeholder:text-gray-400"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedIndex((i) => (i + 1) % Math.max(filteredActions.length, 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedIndex((i) => (i - 1 + filteredActions.length) % Math.max(filteredActions.length, 1));
              } else if (e.key === "Enter" && filteredActions.length > 0) {
                filteredActions[selectedIndex].perform();
                setIsOpen(false);
              }
            }}
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {filteredActions.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              No results found for "{query}".
            </div>
          ) : (
            <div className="space-y-1">
              {filteredActions.map((action, index) => {
                const prevAction = filteredActions[index - 1];
                const showHeader = !prevAction || prevAction.section !== action.section;
                
                return (
                  <div key={action.id}>
                    {showHeader && (
                      <div className="px-3 py-2 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {action.section}
                      </div>
                    )}
                    <button
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm text-left transition-colors ${
                        index === selectedIndex
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        action.perform();
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={index === selectedIndex ? "text-indigo-600" : "text-gray-400"}>
                          {action.icon}
                        </span>
                        {action.title}
                      </div>
                      {action.subtitle && (
                        <span className="text-xs text-gray-400">{action.subtitle}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        <div className="border-t p-2 px-4 flex items-center justify-between text-xs text-gray-400">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 text-[10px] font-sans">↑</kbd> <kbd className="bg-gray-100 rounded px-1 text-[10px] font-sans">↓</kbd> to navigate</span>
            <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 text-[10px] font-sans">↵</kbd> to select</span>
            <span className="flex items-center gap-1"><kbd className="bg-gray-100 rounded px-1 text-[10px] font-sans">esc</kbd> to close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
