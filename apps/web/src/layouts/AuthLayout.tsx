import { Outlet } from "react-router-dom";
import { Zap } from "lucide-react";

export default function AuthLayout() {
  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--ek-bg-base)" }}
    >
      {/* ── Left Brand Panel (desktop only) ──────── */}
      <div
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden"
        style={{
          width: 420,
          flexShrink: 0,
          background: "linear-gradient(150deg, #4F50E6 0%, #7C3AED 60%, #5B5CEB 100%)",
          color: "white",
        }}
      >
        {/* Decorative circles */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -80,
            right: -80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: -60,
            left: -60,
            width: 240,
            height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
          }}
        />

        {/* Logo */}
        <div className="flex items-center gap-3 relative">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.2)" }}
          >
            <Zap size={20} color="white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-xl tracking-tight">EkaFlow</span>
        </div>

        {/* Hero text */}
        <div className="relative space-y-6">
          <h2
            className="font-bold leading-tight"
            style={{ fontSize: 34, letterSpacing: "-0.02em" }}
          >
            Your business,<br />beautifully managed.
          </h2>
          <p style={{ fontSize: 15, opacity: 0.8, lineHeight: 1.6 }}>
            Invoices, clients, projects, expenses — all in one premium workspace built for modern freelancers.
          </p>

          {/* Social proof chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            {["Invoicing", "CRM", "Time Tracking", "AI Assistant", "Goals"].map((feat) => (
              <span
                key={feat}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ fontSize: 12, opacity: 0.6 }}>
          © {new Date().getFullYear()} EkaFlow Studio. All rights reserved.
        </p>
      </div>

      {/* ── Right Form Panel ─────────────────────── */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div
          className="w-full animate-scale-in"
          style={{ maxWidth: 420 }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #5B5CEB 0%, #8B5CF6 100%)",
              }}
            >
              <Zap size={15} color="white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-lg" style={{ color: "var(--ek-text-primary)" }}>
              EkaFlow
            </span>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
