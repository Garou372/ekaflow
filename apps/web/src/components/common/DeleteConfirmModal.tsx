import { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

type DeleteConfirmModalProps = {
  title: string;
  description: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

// ─── Component ────────────────────────────────────────────────────

export default function DeleteConfirmModal({
  title,
  description,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  // Keyboard: Escape to cancel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isDeleting) onCancel();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, isDeleting]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="ek-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div className="ek-modal" style={{ maxWidth: 420 }}>
        {/* Header */}
        <div
          className="flex items-start justify-between p-6"
          style={{ borderBottom: "1px solid var(--ek-border)" }}
        >
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: "var(--ek-danger-bg)" }}
            >
              <AlertTriangle
                size={22}
                strokeWidth={2}
                style={{ color: "var(--ek-danger)" }}
              />
            </div>

            {/* Title */}
            <div>
              <h3
                id="delete-modal-title"
                className="font-bold"
                style={{ fontSize: 17, color: "var(--ek-text-primary)" }}
              >
                {title}
              </h3>
            </div>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="ek-btn-icon"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "var(--ek-text-secondary)" }}
          >
            {description}
          </p>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 pb-6"
        >
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="ek-btn ek-btn-secondary ek-btn-md"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="ek-btn ek-btn-danger ek-btn-md"
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-ek-spin"
                />
                Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
