import Groq from "groq-sdk";

let _client: Groq | null = null;

export function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}

export async function groqChat(systemPrompt: string, userMessage: string, maxTokens = 2048): Promise<string> {
  const client = getGroqClient();
  if (!client) throw new Error("GROQ_API_KEY not configured");

  const completion = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ],
    temperature: 0.3,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
  });

  return completion.choices[0]?.message?.content ?? "{}";
}
