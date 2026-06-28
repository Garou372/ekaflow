import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import GlobalSearch from "../components/common/GlobalSearch";
import GlobalTimer from "../components/common/GlobalTimer";
import NotificationBell from "../components/common/NotificationBell";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/clients", label: "Clients", exact: false },
  { to: "/projects", label: "Projects", exact: false },
  { to: "/proposals", label: "Proposals", exact: false },
  { to: "/calendar", label: "Calendar", exact: false },
  { to: "/time", label: "Time", exact: false },
  { to: "/invoices", label: "Invoices", exact: false },
  { to: "/expenses", label: "Expenses", exact: false },
  { to: "/settings", label: "Settings", exact: false },
] as const;

export default function AppLayout() {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function isActive(to: string, exact: boolean) {
    return exact ? pathname === to : pathname.startsWith(to);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <span className="text-xl font-bold text-indigo-700 shrink-0">
            EkaFlow
          </span>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive(to, exact)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <GlobalTimer />
          <GlobalSearch />
          <NotificationBell />
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b sticky top-16 z-30">
          <div className="border-t p-4 md:hidden space-y-4">
            <GlobalTimer />
            <div className="flex gap-4">
              <div className="flex-1"><GlobalSearch /></div>
              <NotificationBell />
            </div>
          </div>
          <nav className="flex flex-col p-2">
            {NAV_LINKS.map(({ to, label, exact }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-3 text-sm font-medium transition-colors rounded-md ${
                  isActive(to, exact)
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
}
