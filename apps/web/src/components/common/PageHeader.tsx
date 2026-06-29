import type { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────

type PageHeaderProps = {
  title: string;
  description?: string;
  children?: ReactNode;
};

// ─── Component ────────────────────────────────────────────────────

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6">
      {/* Title block */}
      <div className="min-w-0">
        <h1
          className="font-bold leading-tight tracking-tight"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            color: "var(--ek-text-primary)",
          }}
        >
          {title}
        </h1>

        {description && (
          <p
            className="mt-1.5 text-sm leading-relaxed"
            style={{ color: "var(--ek-text-secondary)", maxWidth: "480px" }}
          >
            {description}
          </p>
        )}
      </div>

      {/* Actions slot */}
      {children && (
        <div className="flex items-center gap-3 shrink-0">{children}</div>
      )}
    </div>
  );
}