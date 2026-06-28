import type { AIProvider } from "./AIProvider";
import { MockAIProvider } from "./MockAIProvider";

export class AIFactory {
  static getProvider(): AIProvider {
    // Future: const providerType = import.meta.env.VITE_AI_PROVIDER || 'mock';
    const providerType = 'mock';

    switch (providerType) {
      // case 'openai':
      //   return new OpenAIProvider();
      // case 'gemini':
      //   return new GeminiProvider();
      case 'mock':
      default:
        return new MockAIProvider();
    }
  }
}
