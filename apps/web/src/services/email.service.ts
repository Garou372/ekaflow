export interface EmailOptions {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export interface EmailProvider {
  sendEmail(options: EmailOptions): Promise<void>;
}

/**
 * Mock Email Adapter for Sprint 8.
 * Simulates sending an email by logging to the console.
 * In a real environment, this would be replaced by a Resend/SendGrid adapter.
 */
export class MockEmailAdapter implements EmailProvider {
  async sendEmail(options: EmailOptions): Promise<void> {
    console.log(`[EMAIL SIMULATION] Sending email to: ${options.to}`);
    console.log(`[EMAIL SIMULATION] Subject: ${options.subject}`);
    console.log(`[EMAIL SIMULATION] Body:\n${options.body}`);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

// Global instance to use throughout the application
export const emailService = new MockEmailAdapter();
