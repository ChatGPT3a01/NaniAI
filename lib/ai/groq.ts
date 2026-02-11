import Groq from "groq-sdk";

export async function callGroq(
  apiKey: string,
  model: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const client = new Groq({ apiKey });
  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [];

  if (systemPrompt) {
    messages.push({ role: "system", content: systemPrompt });
  }
  messages.push({ role: "user", content: prompt });

  const response = await client.chat.completions.create({
    model,
    messages,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || "";
}
