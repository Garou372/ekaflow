import {
  Star, Phone, Mail, Calendar, Clock, Tag,
  TrendingUp, AlertCircle, History,
  Pencil, Trash2,
} from "lucide-react";
import type { Client, ClientPriority } from "../../../services/client.service";
import type { Invoice } from "../../invoices/types/invoice";
import { formatCurrency } from "../../invoices/utils/currency";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";

// ─── Priority config ──────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  ClientPriority,
  { label: string; bg: string; text: string; dot: string }
> = {
  vip: {
    label: "VIP",
    bg: "#FFFBEB",
    text: "#D97706",
    dot: "#FBBF24",
  },
  high: {
    label: "High",
    bg: "var(--ek-primary-50)",
    text: "var(--ek-primary)",
    dot: "var(--ek-primary)",
  },
  normal: {
    label: "Normal",
    bg: "#F8FAFC",
    text: "#64748B",
    dot: "#94A3B8",
  },
  low: {
    label: "Low",
    bg: "#F8FAFC",
    text: "#94A3B8",
    dot: "#CBD5E1",
  },
};

// ─── Component ────────────────────────────────────────────────────

type ClientCardProps = {
  client: Client;
  invoices?: Invoice[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewHistory?: (client: Client) => void;
  onToggleFavorite?: (id: string, isFavorite: boolean) => void;
};

export default function ClientCard({
  client,
  invoices = [],
  onEdit,
  onDelete,
  onViewHistory,
  onToggleFavorite,
}: ClientCardProps) {
  const priority = client.priority ?? "normal";
  const pcfg = PRIORITY_CONFIG[priority];

  // CRM metrics
  const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
  const lifetimeRevenue = clientInvoices
    .filter((inv) => inv.status === "paid")
    .reduce(
      (sum, inv) =>
        sum + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total,
      0,
    );
  const outstanding = clientInvoices
    .filter((inv) => ["sent", "overdue"].includes(inv.status))
    .reduce(
      (sum, inv) =>
        sum + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total,
      0,
    );
  const hasOverdue = clientInvoices.some((inv) => inv.status === "overdue");

  // Avatar initials
  const avatar = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Follow-up
  const followUpDate = client.next_follow_up_at
    ? new Date(client.next_follow_up_at)
    : null;
  const isFollowUpOverdue = followUpDate ? followUpDate < new Date() : false;

  // Avatar background — gradient for VIP, solid color otherwise
  const avatarStyle =
    priority === "vip"
      ? { background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)", color: "white" }
      : { background: "var(--ek-primary-50)", color: "var(--ek-primary)" };

  return (
    <div
      className={`ek-card ek-card-hover flex flex-col relative${
        client.is_favorite ? " ring-2 ring-amber-200 ring-offset-0" : ""
      }`}
      style={hasOverdue ? { borderColor: "#FECACA" } : undefined}
    >
      {/* ── Header ─────────────────────────────── */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-bold"
              style={avatarStyle}
            >
              {avatar}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3
                  className="font-bold leading-tight truncate"
                  style={{ fontSize: 15, color: "var(--ek-text-primary)" }}
                >
                  {client.name}
                </h3>
                {hasOverdue && (
                  <AlertCircle
                    size={13}
                    style={{ color: "var(--ek-danger)", flexShrink: 0 }}
                  />
                )}
              </div>
              {client.company && (
                <p
                  className="truncate"
                  style={{ fontSize: 12, color: "var(--ek-text-tertiary)", marginTop: 1 }}
                >
                  {client.company}
                </p>
              )}
            </div>
          </div>

          {/* Priority + Favorite + Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Priority badge */}
            <span
              className="ek-badge"
              style={{
                background: pcfg.bg,
                color: pcfg.text,
                border: "1px solid",
                borderColor: pcfg.dot + "40",
                padding: "2px 10px",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: pcfg.dot,
                  display: "inline-block",
                }}
              />
              {pcfg.label}
            </span>

            {/* Favorite star */}
            {onToggleFavorite && client.id && (
              <button
                onClick={() => onToggleFavorite(client.id!, !client.is_favorite)}
                aria-label={
                  client.is_favorite ? "Remove from favorites" : "Add to favorites"
                }
                className="ek-btn-icon"
                style={{ padding: 4 }}
              >
                <Star
                  size={15}
                  style={
                    client.is_favorite
                      ? { fill: "#FBBF24", color: "#FBBF24" }
                      : { color: "var(--ek-text-tertiary)" }
                  }
                />
              </button>
            )}
          </div>
        </div>

        {/* ── Contact info ── */}
        <div className="mt-4 space-y-1.5">
          <div
            className="flex items-center gap-2"
            style={{ fontSize: 12, color: "var(--ek-text-secondary)" }}
          >
            <Mail size={12} style={{ color: "var(--ek-text-tertiary)", flexShrink: 0 }} />
            <span className="truncate">{client.email}</span>
          </div>

          {client.phone && (
            <div
              className="flex items-center gap-2"
              style={{ fontSize: 12, color: "var(--ek-text-secondary)" }}
            >
              <Phone size={12} style={{ color: "var(--ek-text-tertiary)", flexShrink: 0 }} />
              <span>{client.phone}</span>
            </div>
          )}

          {client.last_contacted_at && (
            <div
              className="flex items-center gap-2"
              style={{ fontSize: 12, color: "var(--ek-text-tertiary)" }}
            >
              <Clock size={12} style={{ flexShrink: 0 }} />
              <span>
                Last contacted{" "}
                {new Date(client.last_contacted_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}

          {followUpDate && (
            <div
              className="flex items-center gap-2"
              style={{
                fontSize: 12,
                color: isFollowUpOverdue ? "var(--ek-danger)" : "var(--ek-text-tertiary)",
              }}
            >
              <Calendar size={12} style={{ flexShrink: 0 }} />
              <span>
                Follow-up{" "}
                {followUpDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                {isFollowUpOverdue && " · Overdue"}
              </span>
            </div>
          )}
        </div>

        {/* ── Tags ── */}
        {client.tags && client.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {client.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="ek-chip" style={{ fontSize: 11, padding: "2px 8px" }}>
                <Tag size={9} />
                {tag}
              </span>
            ))}
            {client.tags.length > 4 && (
              <span style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}>
                +{client.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── CRM Metrics ────────────────────────── */}
      {(lifetimeRevenue > 0 || outstanding > 0) && (
        <div
          className="flex gap-5 px-5 py-3"
          style={{
            borderTop: "1px solid var(--ek-border)",
            background: "var(--ek-bg-base)",
          }}
        >
          {lifetimeRevenue > 0 && (
            <div>
              <p style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}>Lifetime</p>
              <p
                className="flex items-center gap-1 font-bold"
                style={{ fontSize: 13, color: "#16A34A" }}
              >
                <TrendingUp size={11} />
                {formatCurrency(lifetimeRevenue)}
              </p>
            </div>
          )}
          {outstanding > 0 && (
            <div>
              <p style={{ fontSize: 11, color: "var(--ek-text-tertiary)" }}>Outstanding</p>
              <p
                className="font-bold"
                style={{
                  fontSize: 13,
                  color: hasOverdue ? "var(--ek-danger)" : "var(--ek-warning)",
                }}
              >
                {formatCurrency(outstanding)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Actions footer ──────────────────────── */}
      <div
        className="flex items-center gap-2 px-4 py-3 mt-auto"
        style={{
          borderTop: "1px solid var(--ek-border)",
          background: "var(--ek-bg-subtle)",
          borderRadius: "0 0 var(--ek-radius-card) var(--ek-radius-card)",
        }}
      >
        {onViewHistory && (
          <button
            onClick={() => onViewHistory(client)}
            className="ek-btn ek-btn-ghost"
            style={{ fontSize: 12, padding: "5px 10px", marginRight: "auto" }}
          >
            <History size={13} />
            Timeline
          </button>
        )}

        <button
          onClick={() => client.id && onDelete(client.id)}
          className="ek-btn-icon"
          aria-label="Delete client"
          style={{ color: "var(--ek-danger)" }}
        >
          <Trash2 size={14} />
        </button>

        <button
          onClick={() => onEdit(client)}
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
