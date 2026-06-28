import { useState } from "react";
import { aiService } from "../services/ai.service";
import type { AIGenerateOptions } from "../services/ai/AIProvider";
import { useToast } from "./useToast";

export default function useAIAssistant() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { error: errorToast } = useToast();

  const generate = async (options: AIGenerateOptions) => {
    setIsGenerating(true);
    try {
      const result = await aiService.generate(options);
      return result;
    } catch (err) {
      errorToast("AI Assistant Failed", err instanceof Error ? err.message : "Failed to generate content");
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generate,
    isGenerating,
  };
}
