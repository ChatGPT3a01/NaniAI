export type AIProvider = "google" | "openai" | "groq";

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
}

export const PROVIDER_MODELS: Record<AIProvider, { label: string; models: { id: string; name: string }[] }> = {
  google: {
    label: "Google Gemini",
    models: [
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash (推薦)" },
      { id: "gemini-3.0-flash", name: "Gemini 3.0 Flash" },
      { id: "gemini-3.0-pro", name: "Gemini 3.0 Pro" },
    ],
  },
  openai: {
    label: "OpenAI",
    models: [
      { id: "gpt-5.2", name: "GPT-5.2 (推薦)" },
      { id: "gpt-4.1", name: "GPT-4.1" },
    ],
  },
  groq: {
    label: "Groq (免費)",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B (推薦)" },
      { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B (最快)" },
    ],
  },
};

export function getApiConfig(headers: Headers): AIConfig {
  const provider = (headers.get("x-ai-provider") || "google") as AIProvider;
  const apiKey = headers.get("x-ai-api-key") || "";
  const model = headers.get("x-ai-model") || PROVIDER_MODELS[provider].models[0].id;

  if (!apiKey) {
    throw new Error("請先設定 API Key");
  }

  return { provider, apiKey, model };
}
