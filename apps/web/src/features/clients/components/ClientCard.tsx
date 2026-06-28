import { Star, Phone, Mail, Calendar, Clock, Tag, TrendingUp, AlertCircle } from "lucide-react";
import type { Client, ClientPriority } from "../../../services/client.service";
import type { Invoice } from "../../invoices/types/invoice";
import { formatCurrency } from "../../invoices/utils/currency";
import { calculateInvoice } from "../../invoices/utils/calculateInvoice";

// ─── Priority Config ───────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  ClientPriority,
  { label: string; color: string; dot: string }
> = {
  vip: {
    label: "VIP",
    color: "text-amber-600 bg-amber-50 border-amber-200",
    dot: "bg-amber-400",
  },
  high: {
    label: "High",
    color: "text-indigo-600 bg-indigo-50 border-indigo-200",
    dot: "bg-indigo-400",
  },
  normal: {
    label: "Normal",
    color: "text-gray-600 bg-gray-50 border-gray-200",
    dot: "bg-gray-400",
  },
  low: {
    label: "Low",
    color: "text-slate-500 bg-slate-50 border-slate-200",
    dot: "bg-slate-300",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

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
  const priorityCfg = PRIORITY_CONFIG[priority];

  // Derived CRM metrics from invoices
  const clientInvoices = invoices.filter((inv) => inv.clientId === client.id);
  const lifetimeRevenue = clientInvoices
    .filter((inv) => inv.status === "paid")
    .reduce((sum, inv) => sum + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total, 0);
  const outstanding = clientInvoices
    .filter((inv) => ["sent", "overdue"].includes(inv.status))
    .reduce((sum, inv) => sum + calculateInvoice(inv.lineItems, inv.discountRate, inv.taxRate).total, 0);
  const hasOverdue = clientInvoices.some((inv) => inv.status === "overdue");

  const avatar = client.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Format follow-up date
  const followUpDate = client.next_follow_up_at
    ? new Date(client.next_follow_up_at)
    : null;
  const isFollowUpOverdue = followUpDate ? followUpDate < new Date() : false;

  return (
    <div
      className={`group relative flex flex-col rounded-xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${
        client.is_favorite ? "border-amber-200 ring-1 ring-amber-100" : "border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Avatar + Name */}
          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-base font-bold ${
                priority === "vip"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-gray-900 leading-tight">
                  {client.name}
                </h3>
                {hasOverdue && (
                  <AlertCircle size={14} className="text-red-500 shrink-0" />
                )}
              </div>
              {client.company && (
                <p className="text-xs text-gray-500 mt-0.5">{client.company}</p>
              )}
            </div>
          </div>

          {/* Favorite + Priority */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${priorityCfg.color}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priorityCfg.dot}`} />
              {priorityCfg.label}
            </span>

            {onToggleFavorite && client.id && (
              <button
                onClick={() => onToggleFavorite(client.id!, !client.is_favorite)}
                aria-label={client.is_favorite ? "Remove from favorites" : "Add to favorites"}
                className="rounded-md p-1 text-gray-300 transition-colors hover:text-amber-500"
              >
                <Star
                  size={16}
                  className={client.is_favorite ? "fill-amber-400 text-amber-400" : ""}
                />
              </button>
            )}
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Mail size={12} className="shrink-0 text-gray-400" />
            <span className="truncate">{client.email}</span>
          </div>

          {client.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Phone size={12} className="shrink-0 text-gray-400" />
              <span>{client.phone}</span>
            </div>
          )}

          {client.last_contacted_at && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock size={12} className="shrink-0 text-gray-400" />
              <span>
                Last contacted:{" "}
                {new Date(client.last_contacted_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}

          {followUpDate && (
            <div
              className={`flex items-center gap-2 text-xs ${
                isFollowUpOverdue ? "text-red-600" : "text-gray-500"
              }`}
            >
              <Calendar size={12} className="shrink-0" />
              <span>
                Follow-up:{" "}
                {followUpDate.toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })}
                {isFollowUpOverdue && " (Overdue)"}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {client.tags && client.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {client.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                <Tag size={9} />
                {tag}
              </span>
            ))}
            {client.tags.length > 4 && (
              <span className="text-xs text-gray-400">+{client.tags.length - 4}</span>
            )}
          </div>
        )}
      </div>

      {/* CRM Metrics */}
      {(lifetimeRevenue > 0 || outstanding > 0) && (
        <div className="border-t bg-gray-50/50 px-5 py-3">
          <div className="flex gap-4">
            {lifetimeRevenue > 0 && (
              <div>
                <p className="text-xs text-gray-500">Lifetime Revenue</p>
                <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1">
                  <TrendingUp size={12} />
                  {formatCurrency(lifetimeRevenue)}
                </p>
              </div>
            )}
            {outstanding > 0 && (
              <div>
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className={`text-sm font-semibold ${hasOverdue ? "text-red-500" : "text-amber-600"}`}>
                  {formatCurrency(outstanding)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 border-t bg-gray-50 px-4 py-3 mt-auto rounded-b-xl">
        {onViewHistory && (
          <button
            onClick={() => onViewHistory(client)}
            className="mr-auto rounded-lg px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
          >
            Timeline
          </button>
        )}

        <button
          onClick={() => client.id && onDelete(client.id)}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          Delete
        </button>

        <button
          onClick={() => onEdit(client)}
          className="rounded-lg border px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Edit
        </button>
      </div>
    </div>
  );
}
