import type { AIGenerateOptions, AIProvider } from "./AIProvider";

const TASK_RESPONSES: Partial<Record<string, string>> = {
  improve_proposal:
    "Here is an improved version of your proposal:\n\n**Scope of Work**\nWe will deliver a comprehensive solution tailored to your business needs, ensuring quality and on-time delivery.\n\n**Value Proposition**\nOur approach combines proven methodology with industry expertise to maximize your ROI.\n\n**Timeline & Deliverables**\nPhase 1 (Week 1–2): Discovery & Planning\nPhase 2 (Week 3–4): Design & Development\nPhase 3 (Week 5): Review & Delivery\n\nWe look forward to partnering with you on this exciting project.",

  improve_invoice_notes:
    "Thank you for choosing our services. Payment is due within 30 days of the invoice date. Please transfer to the bank details provided. For queries, contact us at the email above. We appreciate your prompt payment and look forward to continuing our partnership.",

  generate_followup_email:
    "Subject: Following up on our proposal\n\nDear [Client Name],\n\nI hope this message finds you well. I'm writing to follow up on the proposal I sent last week regarding [Project Name].\n\nI wanted to check if you had a chance to review it and if you have any questions or require any clarifications.\n\nI'm happy to arrange a call at your convenience to discuss further.\n\nWarm regards,\n[Your Name]",

  generate_meeting_summary:
    "**Meeting Summary**\n\nAttendees: [Client] and [You]\nDate: [Date]\n\n**Key Discussion Points:**\n- Project scope and deliverables reviewed\n- Timeline agreed upon\n- Budget confirmed\n\n**Action Items:**\n- [Client]: Send brand assets by [Date]\n- [You]: Share initial wireframes by [Date]\n\n**Next Steps:** Follow-up call scheduled for [Date].",

  generate_client_reply:
    "Dear [Client Name],\n\nThank you for reaching out. I understand your requirements and would be happy to assist.\n\nI'll review your request and get back to you with a detailed response within 24 hours.\n\nPlease don't hesitate to reach out if you have any urgent queries.\n\nBest regards,\n[Your Name]",

  generate_project_summary:
    "**Project Summary**\n\nProject status: In Progress\n\nCompleted milestones: Discovery and initial design phases are complete.\n\nCurrent focus: Development is underway with 60% of core features implemented.\n\nRisks: Minor scope clarification needed on the reporting module.\n\nNext milestone: Beta delivery scheduled for end of month.",

  categorize_expense:
    "Based on the description, this expense is best categorized as **Professional Services**. Consider sub-categories: Software Tools, Subscriptions, or Equipment based on the specific item.",
};

/**
 * Mock AI Provider — used in development/₹0 budget mode.
 * Simulates realistic AI responses for each task type.
 */
export class MockAIProvider implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    await this._delay(1200);

    if (prompt.toLowerCase().includes("invoice notes")) {
      return TASK_RESPONSES.improve_invoice_notes!;
    }
    if (prompt.toLowerCase().includes("proposal")) {
      return TASK_RESPONSES.improve_proposal!;
    }
    return "Here is some AI-generated professional text based on your context.";
  }

  async generate(options: AIGenerateOptions): Promise<string> {
    await this._delay(1200);

    const response = TASK_RESPONSES[options.taskType];
    if (response) return response;

    // Fallback for custom or unrecognized tasks
    return `AI-generated content for: ${options.context.substring(0, 100)}...\n\nThis is a mock response. Connect a real AI provider for production use.`;
  }

  private _delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
