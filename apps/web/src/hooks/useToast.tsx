import { createContext, useCallback, useContext, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number; // ms, default 4000
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (options: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const toast = useCallback(
    (options: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      const duration = options.duration ?? 4000;

      setToasts((prev) => [...prev.slice(-4), { ...options, id }]); // max 5 toasts

      timers.current[id] = setTimeout(() => {
        dismiss(id);
      }, duration);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");

  return {
    toast: ctx.toast,
    dismiss: ctx.dismiss,
    // Convenience shorthands
    success: (title: string, description?: string) =>
      ctx.toast({ variant: "success", title, description }),
    error: (title: string, description?: string) =>
      ctx.toast({ variant: "error", title, description, duration: 6000 }),
    warning: (title: string, description?: string) =>
      ctx.toast({ variant: "warning", title, description }),
    info: (title: string, description?: string) =>
      ctx.toast({ variant: "info", title, description }),
  };
}

// Export raw context for ToastContainer
export { ToastContext };
