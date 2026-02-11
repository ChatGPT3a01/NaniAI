import { AIConfig } from "./provider";
import { callGemini } from "./gemini";
import { callOpenAI } from "./openai";
import { callGroq } from "./groq";

export async function callLLM(
  config: AIConfig,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  switch (config.provider) {
    case "google":
      return callGemini(config.apiKey, config.model, prompt, systemPrompt);
    case "openai":
      return callOpenAI(config.apiKey, config.model, prompt, systemPrompt);
    case "groq":
      return callGroq(config.apiKey, config.model, prompt, systemPrompt);
    default:
      throw new Error(`不支援的 AI Provider: ${config.provider}`);
  }
}
