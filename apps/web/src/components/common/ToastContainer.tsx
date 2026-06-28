import { useContext } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { ToastContext, type Toast } from "../../hooks/useToast";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICONS = {
  success: <CheckCircle size={18} className="shrink-0 text-emerald-500" />,
  error: <XCircle size={18} className="shrink-0 text-red-500" />,
  warning: <AlertTriangle size={18} className="shrink-0 text-amber-500" />,
  info: <Info size={18} className="shrink-0 text-blue-500" />,
};

const BORDER_COLORS = {
  success: "border-l-emerald-500",
  error: "border-l-red-500",
  warning: "border-l-amber-500",
  info: "border-l-blue-500",
};

// ─── Single Toast ─────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex w-full max-w-sm items-start gap-3 rounded-lg border border-l-4 bg-white px-4 py-3
        shadow-lg ring-1 ring-black/5
        animate-in slide-in-from-right-5 duration-300
        ${BORDER_COLORS[toast.variant]}
      `}
    >
      {ICONS[toast.variant]}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        {toast.description && (
          <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="shrink-0 rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────

export default function ToastContainer() {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  const { toasts, dismiss } = ctx;

  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm"
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
