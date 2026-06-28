import { supabase } from "../lib/supabase";
import { automationEngine } from "./automation.service";

export interface AuditLogOptions {
  action: string; // e.g., 'invoice.created'
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
      // 1. Log to database
      const { error } = await supabase.from("audit_logs").insert([{
        action: options.action,
        entity_type: options.entity_type,
        entity_id: options.entity_id,
        metadata: options.metadata || {},
      }]);

      if (error) {
        console.error("[AuditLogger] Failed to insert log:", error);
      }

      // 2. Emit to Automation Engine so rules can trigger
      // Note: In a production system, this could be decoupled via pub/sub.
      // Here, AuditLogger acts as the central event emitter.
      await automationEngine.emit({
        eventName: options.action,
        payload: {
          entity_type: options.entity_type,
          entity_id: options.entity_id,
          ...options.metadata
        }
      });

    } catch (err) {
      console.error("[AuditLogger] Unexpected error:", err);
    }
  }
}

export const auditService = new DefaultAuditLogger();
