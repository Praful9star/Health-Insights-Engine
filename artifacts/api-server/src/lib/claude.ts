import { anthropic } from "@workspace/integrations-anthropic-ai";

export function isAiAvailable(): boolean {
  return !!(
    process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL &&
    process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY
  );
}

export async function claudeChat(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 8192,
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") return "{}";
  return block.text;
}

export async function claudeVision(
  base64Image: string,
  mimeType: "image/jpeg" | "image/png" | "image/gif" | "image/webp",
  prompt: string,
  maxTokens = 8192,
): Promise<string> {
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType,
              data: base64Image,
            },
          },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const block = message.content[0];
  if (!block || block.type !== "text") return "";
  return block.text;
}
