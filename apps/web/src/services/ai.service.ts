import { AIFactory } from "./ai/AIFactory";
export * from "./ai/AIProvider";

// Global instance resolved via Factory
export const aiService = AIFactory.getProvider();
