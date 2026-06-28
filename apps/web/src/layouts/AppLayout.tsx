import { Link, Outlet, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/", label: "Dashboard", exact: true },
  { to: "/clients", label: "Clients", exact: false },
  { to: "/proposals", label: "Proposals", exact: false },
  { to: "/invoices", label: "Invoices", exact: false },
] as const;

export default function AppLayout() {
  const { pathname } = useLocation();

  function isActive(to: string, exact: boolean) {
    return exact ? pathname === to : pathname.startsWith(to);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="h-16 border-b bg-white flex items-center gap-8 px-6">
        <span className="text-xl font-bold text-indigo-700 shrink-0">
          EkaFlow
        </span>

        <nav className="flex items-center gap-1">
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
      </header>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
