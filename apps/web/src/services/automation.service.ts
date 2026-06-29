import { supabase } from "../lib/supabase";
import { createNotification } from "./notification.service";

export interface AutomationCondition {
  field: string;
  operator: "eq" | "neq" | "gt" | "lt";
  value: any;
}

export interface AutomationAction {
  type: "notification" | "enqueue_job" | "email";
  [key: string]: any;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger_event: string;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  is_active: boolean;
}

export interface AutomationEvent {
  eventName: string;
  payload: Record<string, any>;
}

export interface AutomationEngineProvider {
  emit(event: AutomationEvent): Promise<void>;
}

export class DefaultAutomationEngine implements AutomationEngineProvider {
  async emit(event: AutomationEvent): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("trigger_event", event.eventName)
        .eq("is_active", true);

      if (error) throw error;

      const rules = (data ?? []) as AutomationRule[];

      for (const rule of rules) {
        if (this.evaluateConditions(rule.conditions, event.payload)) {
          await this.executeActions(rule.actions, event.payload, rule.id);
        }
      }
    } catch (err) {
      console.error(
        `[AutomationEngine] Failed to process event "${event.eventName}":`,
        err,
      );
    }
  }

  private evaluateConditions(
    conditions: AutomationCondition[],
    payload: Record<string, any>,
  ): boolean {
    for (const condition of conditions) {
      const actual = payload[condition.field];
      switch (condition.operator) {
        case "eq":
          if (actual !== condition.value) return false;
          break;
        case "neq":
          if (actual === condition.value) return false;
          break;
        case "gt":
          if (actual <= condition.value) return false;
          break;
        case "lt":
          if (actual >= condition.value) return false;
          break;
        default:
          return false;
      }
    }
    return true;
  }

  private async executeActions(
    actions: AutomationAction[],
    payload: Record<string, any>,
    ruleId: string,
  ): Promise<void> {
    for (const action of actions) {
      try {
        switch (action.type) {
          case "notification": {
            await createNotification({
              type: action.notification_type ?? "system",
              title: action.title ?? "Automation Triggered",
              message:
                action.message ??
                `Automated action for ${payload.entity_id ?? "system"}`,
              link_url: action.link_url ?? null,
            });
            break;
          }

          case "enqueue_job": {
            // Write job to job_queue table for background processing
            const { error } = await supabase.from("job_queue").insert([
              {
                job_name: action.job_name ?? "unknown_job",
                payload: {
                  ...payload,
                  rule_id: ruleId,
                  action_config: action,
                },
                status: "pending",
              },
            ]);

            if (error) {
              console.error(
                `[AutomationEngine] Failed to enqueue job "${action.job_name}":`,
                error,
              );
            }
            break;
          }

          case "email": {
            // Email delivery is deferred to a server-side provider (Resend).
            // When the email integration is wired, replace this with an API call.
            // For now we enqueue it as a job so no emails are silently dropped.
            const { error } = await supabase.from("job_queue").insert([
              {
                job_name: "send_email",
                payload: {
                  to: action.to ?? payload.email ?? null,
                  subject: action.subject ?? "",
                  template: action.template ?? "",
                  context: payload,
                  rule_id: ruleId,
                },
                status: "pending",
              },
            ]);

            if (error) {
              console.error(
                "[AutomationEngine] Failed to enqueue email job:",
                error,
              );
            }
            break;
          }

          default:
            console.warn(
              `[AutomationEngine] Unknown action type: ${action.type}`,
            );
        }
      } catch (err) {
        console.error(
          `[AutomationEngine] Action "${action.type}" threw unexpectedly:`,
          err,
        );
      }
    }
  }
}

export const automationEngine = new DefaultAutomationEngine();
