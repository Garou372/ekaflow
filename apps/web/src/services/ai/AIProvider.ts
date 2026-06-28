/**
 * AIProvider interface — the single contract that all AI implementations must fulfil.
 *
 * Extend this interface here when adding new capabilities.
 * Never import a concrete provider directly outside of AIFactory.
 */

export type AITaskType =
  | "improve_proposal"
  | "improve_invoice_notes"
  | "generate_followup_email"
  | "generate_meeting_summary"
  | "generate_client_reply"
  | "generate_project_summary"
  | "categorize_expense"
  | "custom";

export interface AIGenerateOptions {
  taskType: AITaskType;
  context: string;      // Freeform context for the prompt
  previousContent?: string; // Existing content to improve
  tone?: "professional" | "friendly" | "formal";
  language?: string;   // ISO language code, default "en"
}

export interface AIProvider {
  /** Legacy single-prompt method (kept for backward compat) */
  generateText(prompt: string): Promise<string>;

  /** New structured generation method */
  generate(options: AIGenerateOptions): Promise<string>;
}
