import { useState } from "react";
import { aiService } from "../services/ai.service";

export default function useAIService() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const result = await aiService.generateText(prompt);
      return result;
    } catch (err) {
      setError("AI generation failed.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateText,
    isGenerating,
    error,
  };
}
