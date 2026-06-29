import { Folder, Clock, CheckCircle, PauseCircle, Pencil, Trash2, Receipt } from "lucide-react";
import type { Project } from "../types/project";
import { formatCurrency } from "../../invoices/utils/currency";

// ─── Status config ────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Project["status"],
  { label: string; icon: typeof Folder; bg: string; text: string }
> = {
  active: {
    label: "Active",
    icon: Folder,
    bg: "var(--ek-primary-50)",
    text: "var(--ek-primary)",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle,
    bg: "#F0FDF4",
    text: "#16A34A",
  },
  on_hold: {
    label: "On Hold",
    icon: PauseCircle,
    bg: "#FFFBEB",
    text: "#D97706",
  },
};

// ─── Types ────────────────────────────────────────────────────────

type Props = {
  project: Project;
  clientName?: string;
  unbilledMinutes?: number;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onInvoiceTime?: (project: Project) => void;
};

// ─── Component ────────────────────────────────────────────────────

export default function ProjectCard({
  project,
  clientName,
  unbilledMinutes = 0,
  onEdit,
  onDelete,
  onInvoiceTime,
}: Props) {
  const sc = STATUS_CONFIG[project.status] ?? STATUS_CONFIG.active;
  const StatusIcon = sc.icon;

  return (
    <div className="ek-card ek-card-hover flex flex-col">
      {/* ── Body ──────────────────────────────── */}
      <div className="p-5 flex-1">
        {/* Header: icon + name + status badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Status icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: sc.bg, color: sc.text }}
            >
              <StatusIcon size={19} strokeWidth={2} />
            </div>

            <div className="min-w-0">
              <h3
                className="font-bold leading-tight truncate"
                style={{ fontSize: 15, color: "var(--ek-text-primary)" }}
              >
                {project.name}
              </h3>
              <p
                className="truncate mt-0.5"
                style={{ fontSize: 12, color: "var(--ek-text-tertiary)" }}
              >
                {clientName ?? "Unknown Client"}
              </p>
            </div>
          </div>

          {/* Status badge */}
          <span
            className="ek-badge shrink-0"
            style={{
              background: sc.bg,
              color: sc.text,
              border: "1px solid",
              borderColor: sc.text + "30",
              fontSize: 11,
              padding: "3px 10px",
            }}
          >
            {sc.label}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p
            className="truncate-2 mb-4"
            style={{ fontSize: 13, color: "var(--ek-text-secondary)", lineHeight: 1.5 }}
          >
            {project.description}
          </p>
        )}

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-y-3 gap-x-4">
          {project.budget !== null && (
            <div>
              <p style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}>Budget</p>
              <p
                className="font-bold mt-0.5"
                style={{ fontSize: 14, color: "var(--ek-text-primary)" }}
              >
                {formatCurrency(project.budget)}
              </p>
            </div>
          )}
          {project.hourly_rate !== null && (
            <div>
              <p style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}>Rate</p>
              <p
                className="font-bold mt-0.5"
                style={{ fontSize: 14, color: "var(--ek-text-primary)" }}
              >
                {formatCurrency(project.hourly_rate)}/hr
              </p>
            </div>
          )}
          {project.due_date && (
            <div>
              <p style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}>Due date</p>
              <p
                className="flex items-center gap-1 mt-0.5 font-medium"
                style={{ fontSize: 13, color: "var(--ek-text-secondary)" }}
              >
                <Clock size={11} />
                {new Date(project.due_date).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>
          )}
          {unbilledMinutes > 0 && (
            <div>
              <p style={{ fontSize: 11, color: "var(--ek-warning)" }}>Unbilled time</p>
              <p
                className="font-bold mt-0.5"
                style={{ fontSize: 14, color: "var(--ek-warning)" }}
              >
                {Math.floor(unbilledMinutes / 60)}h {unbilledMinutes % 60}m
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Actions ───────────────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          borderTop: "1px solid var(--ek-border)",
          background: "var(--ek-bg-subtle)",
          borderRadius: "0 0 var(--ek-radius-card) var(--ek-radius-card)",
        }}
      >
        {unbilledMinutes > 0 && onInvoiceTime && (
          <button
            onClick={() => onInvoiceTime(project)}
            className="ek-btn ek-btn-ghost"
            style={{ fontSize: 12, padding: "5px 10px", marginRight: "auto" }}
          >
            <Receipt size={13} />
            Invoice Time
          </button>
        )}

        <button
          onClick={() => onDelete(project.id)}
          className="ek-btn-icon"
          aria-label="Delete project"
          style={{
            color: "var(--ek-danger)",
            marginLeft: unbilledMinutes === 0 ? "auto" : undefined,
          }}
        >
          <Trash2 size={15} />
        </button>

        <button
          onClick={() => onEdit(project)}
          className="ek-btn ek-btn-secondary"
          style={{ fontSize: 12, padding: "5px 14px" }}
        >
          <Pencil size={12} />
          Edit
        </button>
      </div>
    </div>
  );
}
