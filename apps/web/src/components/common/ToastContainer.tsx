import { useContext } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { ToastContext, type Toast } from "../../hooks/useToast";

// ─── Variant config ───────────────────────────────────────────────

const VARIANTS = {
  success: {
    icon:    <CheckCircle size={18} strokeWidth={2} />,
    accent:  "#22C55E",
    bg:      "#F0FDF4",
    border:  "#BBF7D0",
  },
  error: {
    icon:    <XCircle size={18} strokeWidth={2} />,
    accent:  "#EF4444",
    bg:      "#FEF2F2",
    border:  "#FECACA",
  },
  warning: {
    icon:    <AlertTriangle size={18} strokeWidth={2} />,
    accent:  "#F59E0B",
    bg:      "#FFFBEB",
    border:  "#FDE68A",
  },
  info: {
    icon:    <Info size={18} strokeWidth={2} />,
    accent:  "#5B5CEB",
    bg:      "#EEEFFE",
    border:  "#C4C5FC",
  },
} satisfies Record<Toast["variant"], { icon: React.ReactNode; accent: string; bg: string; border: string }>;

// ─── Single Toast Item ────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const v = VARIANTS[toast.variant];

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="ek-toast"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        maxWidth: 360,
        padding: "14px 16px",
        borderRadius: 14,
        background: v.bg,
        border: `1.5px solid ${v.border}`,
        boxShadow: "0 8px 32px rgba(16,24,40,0.12), 0 2px 8px rgba(16,24,40,0.06)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left accent bar */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: v.accent,
          borderRadius: "14px 0 0 14px",
        }}
      />

      {/* Icon */}
      <div style={{ color: v.accent, flexShrink: 0, marginTop: 1 }}>
        {v.icon}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          className="font-semibold leading-tight"
          style={{ fontSize: 14, color: "#111827" }}
        >
          {toast.title}
        </p>
        {toast.description && (
          <p
            className="mt-1 leading-snug line-clamp-2"
            style={{ fontSize: 13, color: "#64748B" }}
          >
            {toast.description}
          </p>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded-lg transition-all duration-150"
        style={{
          padding: 4,
          color: "#94A3B8",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: -2,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "rgba(16,24,40,0.06)";
          (e.currentTarget as HTMLButtonElement).style.color = "#475569";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          (e.currentTarget as HTMLButtonElement).style.color = "#94A3B8";
        }}
      >
        <X size={15} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────

export default function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  const { toasts, dismiss } = ctx;
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        maxWidth: 360,
        pointerEvents: "auto",
      }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
}
