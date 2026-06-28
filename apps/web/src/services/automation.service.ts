import { supabase } from "../lib/supabase";
import { createNotification } from "./notification.service";

// Define the shape of rules and events
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
      // 1. Fetch active rules for this event
      const { data, error } = await supabase
        .from("automation_rules")
        .select("*")
        .eq("trigger_event", event.eventName)
        .eq("is_active", true);

      if (error) throw error;
      const rules = data as AutomationRule[];

      // 2. Evaluate each rule
      for (const rule of rules) {
        if (this.evaluateConditions(rule.conditions, event.payload)) {
          await this.executeActions(rule.actions, event.payload);
        }
      }
    } catch (err) {
      console.error(`[AutomationEngine] Failed to process event ${event.eventName}:`, err);
    }
  }

  private evaluateConditions(conditions: AutomationCondition[], payload: Record<string, any>): boolean {
    for (const condition of conditions) {
      const actualValue = payload[condition.field];
      switch (condition.operator) {
        case "eq":
          if (actualValue !== condition.value) return false;
          break;
        case "neq":
          if (actualValue === condition.value) return false;
          break;
        case "gt":
          if (actualValue <= condition.value) return false;
          break;
        case "lt":
          if (actualValue >= condition.value) return false;
          break;
        default:
          return false;
      }
    }
    return true; // All conditions met (or no conditions)
  }

  private async executeActions(actions: AutomationAction[], payload: Record<string, any>): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case "notification":
          await createNotification({
            type: "system",
            title: "Automation Triggered",
            message: action.template || `Automated action for ${payload.id || 'system'}`,
            link_url: null,
          });
          break;
        case "enqueue_job":
          // To be integrated in Milestone 2
          console.log(`[AutomationEngine] Enqueueing job: ${action.job_name}`, payload);
          break;
        case "email":
          // To be integrated with EmailProvider
          console.log(`[AutomationEngine] Sending email...`, action, payload);
          break;
        default:
          console.warn(`[AutomationEngine] Unknown action type: ${action.type}`);
      }
    }
  }
}

// Global instance to use throughout the application
export const automationEngine = new DefaultAutomationEngine();
