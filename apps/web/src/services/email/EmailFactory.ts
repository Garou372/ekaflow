import type { EmailProvider } from "./EmailProvider";
import { MockEmailProvider } from "./MockEmailProvider";

export class EmailFactory {
  static getProvider(): EmailProvider {
    // Future: const providerType = import.meta.env.VITE_EMAIL_PROVIDER || 'mock';
    const providerType = 'mock';

    switch (providerType) {
      // case 'resend':
      //   return new ResendProvider();
      // case 'smtp':
      //   return new SmtpProvider();
      case 'mock':
      default:
        return new MockEmailProvider();
    }
  }
}
