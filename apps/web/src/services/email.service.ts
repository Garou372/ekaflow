import { EmailFactory } from "./email/EmailFactory";
export * from "./email/EmailProvider";

// Global instance resolved via Factory
export const emailService = EmailFactory.getProvider();
