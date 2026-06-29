import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
};

// ─── Component ────────────────────────────────────────────────────

/**
 * Premium empty state container used across all feature pages.
 * Uses .ek-empty CSS class for consistent styling (dashed border,
 * subtle background, fade-up animation).
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="ek-empty">
      {/* Icon container */}
      <div
        className="flex items-center justify-center w-14 h-14 rounded-2xl mb-5"
        style={{
          background: "var(--ek-primary-50)",
          color: "var(--ek-primary)",
        }}
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className="font-bold mb-2"
        style={{ fontSize: 17, color: "var(--ek-text-primary)" }}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className="mb-6 max-w-xs"
          style={{
            fontSize: 14,
            color: "var(--ek-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          {description}
        </p>
      )}

      {/* CTA */}
      {action && <div>{action}</div>}
    </div>
  );
}
