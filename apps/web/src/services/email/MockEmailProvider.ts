import type { EmailOptions, EmailProvider } from "./EmailProvider";

/**
 * Mock Email Provider for local development or ₹0 budget mode.
 * Simulates sending an email by logging to the console.
 */
export class MockEmailProvider implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<void> {
    console.log(`[MockEmailProvider] Sending email to: ${options.to}`);
    console.log(`[MockEmailProvider] Subject: ${options.subject}`);
    console.log(`[MockEmailProvider] Body:\n${options.body}`);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
