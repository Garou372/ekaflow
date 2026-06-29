import { supabase } from "../lib/supabase";
import { automationEngine } from "./automation.service";

export interface AuditLogOptions {
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata?: Record<string, any>;
}

export interface AuditLogger {
  log(options: AuditLogOptions): Promise<void>;
}

export class DefaultAuditLogger implements AuditLogger {
  async log(options: AuditLogOptions): Promise<void> {
    try {
      const { error } = await supabase.from("audit_logs").insert([{
        action: options.action,
        entity_type: options.entity_type,
        entity_id: options.entity_id,
        metadata: options.metadata ?? {},
      }]);

      if (error) {
        console.error("[AuditLogger] Failed to insert log:", error);
      }

      await automationEngine.emit({
        eventName: options.action,
        payload: {
          entity_type: options.entity_type,
          entity_id: options.entity_id,
          ...options.metadata,
        },
      });
    } catch (err) {
      console.error("[AuditLogger] Unexpected error:", err);
    }
  }
}

export const auditService = new DefaultAuditLogger();

// ─── Supported audit actions (for autocomplete safety) ───────────────────────
export const AUDIT_ACTIONS = {
  // Invoices
  INVOICE_CREATED: "invoice.created",
  INVOICE_UPDATED: "invoice.updated",
  INVOICE_DELETED: "invoice.deleted",
  INVOICE_STATUS_CHANGED: "invoice.status_changed",
  // Proposals
  PROPOSAL_CREATED: "proposal.created",
  PROPOSAL_UPDATED: "proposal.updated",
  PROPOSAL_DELETED: "proposal.deleted",
  PROPOSAL_STATUS_CHANGED: "proposal.status_changed",
  // Clients
  CLIENT_CREATED: "client.created",
  CLIENT_UPDATED: "client.updated",
  CLIENT_DELETED: "client.deleted",
} as const;