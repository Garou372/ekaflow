export interface AIProvider {
  generateText(prompt: string): Promise<string>;
}

export class MockAIAdapter implements AIProvider {
  async generateText(prompt: string): Promise<string> {
    console.log(`[AI SIMULATION] Processing prompt: ${prompt}`);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    if (prompt.includes("invoice notes")) {
      return "Thank you for your business! Please remit payment by the due date. For any questions regarding this invoice, please do not hesitate to contact me. We appreciate your prompt payment.";
    }
    
    if (prompt.includes("proposal")) {
      return "This proposal outlines the scope, deliverables, and timeline for the upcoming project. Our goal is to ensure high quality and timely delivery, aligning with your business objectives.";
    }

    return "Here is some AI-generated professional text based on your context.";
  }
}

// Global instance to use throughout the application
export const aiService = new MockAIAdapter();
