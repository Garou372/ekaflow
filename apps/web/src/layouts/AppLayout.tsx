import { useState, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Folder,
  FileText,
  Calendar,
  Clock,
  Receipt,
  DollarSign,
  Bell,
  Target,
  Sparkles,
  BookOpen,
  Settings,
  UserPlus,
  CreditCard,
  Menu,
  X,
  Zap,
} from "lucide-react";

import { browserScheduler } from "../services/job.service";
import ErrorBoundary from "../components/common/ErrorBoundary";
import GlobalSearch from "../components/common/GlobalSearch";
import GlobalTimer from "../components/common/GlobalTimer";
import NotificationBell from "../components/common/NotificationBell";
import CommandPalette from "../components/common/CommandPalette";
import WorkspaceSwitcher from "../components/common/WorkspaceSwitcher";
import FeedbackWidget from "../components/common/FeedbackWidget";
import useAuth from "../hooks/useAuth";

// ─── Navigation Structure ─────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: null,
    items: [
      { to: "/",         label: "Dashboard",  icon: LayoutDashboard, exact: true  },
      { to: "/insights", label: "Insights",   icon: TrendingUp,      exact: false },
    ],
  },
  {
    label: "Work",
    items: [
      { to: "/clients",   label: "Clients",   icon: Users,    exact: false },
      { to: "/projects",  label: "Projects",  icon: Folder,   exact: false },
      { to: "/proposals", label: "Proposals", icon: FileText, exact: false },
      { to: "/calendar",  label: "Calendar",  icon: Calendar, exact: false },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/invoices", label: "Invoices",      icon: Receipt,     exact: false },
      { to: "/expenses", label: "Expenses",      icon: DollarSign,  exact: false },
      { to: "/time",     label: "Time Tracking", icon: Clock,       exact: false },
    ],
  },
  {
    label: "Growth",
    items: [
      { to: "/followup", label: "Follow-up", icon: Bell,   exact: false },
      { to: "/goals",    label: "Goals",     icon: Target, exact: false },
    ],
  },
  {
    label: "Tools",
    items: [
      { to: "/assistant",  label: "AI Assistant", icon: Sparkles,  exact: false },
      { to: "/templates",  label: "Templates",    icon: BookOpen,  exact: false },
    ],
  },
] as const;

const BOTTOM_NAV = [
  { to: "/team",     label: "Team",     icon: UserPlus,  exact: false },
  { to: "/billing",  label: "Billing",  icon: CreditCard, exact: false },
  { to: "/settings", label: "Settings", icon: Settings,  exact: false },
] as const;

// ─── NavItem Component ────────────────────────────────────────────

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
}

function NavItem({ to, label, icon: Icon, isActive, onClick }: NavItemProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`ek-nav-item${isActive ? " active" : ""}`}
    >
      <Icon
        size={16}
        strokeWidth={isActive ? 2.5 : 1.75}
        style={{ flexShrink: 0 }}
      />
      <span>{label}</span>
    </Link>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────

export default function AppLayout() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  function isActive(to: string, exact: boolean) {
    return exact ? pathname === to : pathname.startsWith(to);
  }

  // Close sidebar on route change (mobile UX)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  // Initialize background job scheduler
  useEffect(() => {
    browserScheduler.start(60000);
    return () => { browserScheduler.stop(); };
  }, []);

  // User avatar
  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "User";
  const avatarInitial = displayName.charAt(0).toUpperCase();

  return (
    <div
      className="flex overflow-hidden"
      style={{ height: "100dvh", background: "var(--ek-bg-base)" }}
    >
      {/* ── Mobile Backdrop ─────────────────────────────── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: "rgba(15,23,42,0.35)", backdropFilter: "blur(4px)" }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ══ SIDEBAR ════════════════════════════════════════ */}
      <aside
        className={[
          "fixed lg:static inset-y-0 left-0 z-30",
          "flex flex-col bg-white",
          "transition-transform duration-300 ease-in-out lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        style={{
          width: "var(--ek-sidebar-w)",
          borderRight: "1px solid var(--ek-border)",
          boxShadow: isSidebarOpen
            ? "4px 0 32px rgba(16,24,40,0.10)"
            : "none",
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 shrink-0"
          style={{
            height: "var(--ek-topbar-h)",
            borderBottom: "1px solid var(--ek-border)",
          }}
        >
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #5B5CEB 0%, #8B5CF6 100%)",
              boxShadow: "0 2px 8px rgba(91,92,235,0.35)",
            }}
          >
            <Zap size={15} color="white" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div
              className="font-bold leading-none truncate"
              style={{ fontSize: 15, color: "var(--ek-text-primary)" }}
            >
              EkaFlow
            </div>
            <div
              className="mt-0.5 leading-none"
              style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}
            >
              Studio
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV_GROUPS.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "pt-5" : ""}>
              {group.label && (
                <div className="ek-section-label mb-1.5">{group.label}</div>
              )}
              {group.items.map(({ to, label, icon, exact }) => (
                <NavItem
                  key={to}
                  to={to}
                  label={label}
                  icon={icon}
                  isActive={isActive(to, exact)}
                  onClick={() => setIsSidebarOpen(false)}
                />
              ))}
            </div>
          ))}
        </nav>

        {/* Bottom navigation */}
        <div
          className="px-3 py-3 space-y-0.5 shrink-0"
          style={{ borderTop: "1px solid var(--ek-border)" }}
        >
          {BOTTOM_NAV.map(({ to, label, icon, exact }) => (
            <NavItem
              key={to}
              to={to}
              label={label}
              icon={icon}
              isActive={isActive(to, exact)}
              onClick={() => setIsSidebarOpen(false)}
            />
          ))}
        </div>

        {/* Workspace Switcher */}
        <div
          className="px-3 pb-4 pt-2 shrink-0"
          style={{ borderTop: "1px solid var(--ek-border)" }}
        >
          <WorkspaceSwitcher />
        </div>
      </aside>

      {/* ══ MAIN COLUMN ═══════════════════════════════════ */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* ── Top Bar ─────────────────────────────────── */}
        <header
          className="flex items-center gap-3 shrink-0 bg-white"
          style={{
            height: "var(--ek-topbar-h)",
            borderBottom: "1px solid var(--ek-border)",
            padding: "0 20px",
            boxShadow: "0 1px 4px rgba(16,24,40,0.04)",
          }}
        >
          {/* Mobile hamburger */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden ek-btn-icon"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Close mobile sidebar */}
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden ek-btn-icon"
              aria-label="Close navigation menu"
            >
              <X size={20} />
            </button>
          )}

          {/* Search — centered flex */}
          <div className="flex-1 max-w-md">
            <GlobalSearch />
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1 ml-auto">
            <GlobalTimer />
            <NotificationBell />

            {/* User avatar */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ml-1 cursor-pointer select-none shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #5B5CEB 0%, #8B5CF6 100%)",
                boxShadow: "0 1px 6px rgba(91,92,235,0.30)",
              }}
              title={displayName}
              aria-label={`User: ${displayName}`}
            >
              {avatarInitial}
            </div>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────────── */}
        <main
          className="flex-1 overflow-auto"
          style={{
            background: "var(--ek-bg-base)",
            padding: "28px 28px",
          }}
        >
          <div className="ek-page">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Global overlays — always rendered outside layout flow */}
      <CommandPalette />
      <FeedbackWidget />
    </div>
  );
}
