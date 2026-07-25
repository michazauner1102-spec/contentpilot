import Anthropic from "@anthropic-ai/sdk";
import { extractJson, jsonSystemPrompt } from "../extractJson";

export async function anthropicJson<T>(
  model: string,
  apiKey: string,
  system: string,
  user: string,
  schemaHint?: string
): Promise<T> {
  const client = new Anthropic({ apiKey });
  const systemFull = jsonSystemPrompt(system, schemaHint);

  const run = async (): Promise<T> => {
    const message = await client.messages.create({
      model,
      max_tokens: 8192,
      system: systemFull,
      messages: [{ role: "user", content: user }],
    });
    const block = message.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("Keine Text-Antwort vom LLM (Anthropic)");
    }
    return JSON.parse(extractJson(block.text)) as T;
  };

  try {
    return await run();
  } catch (err) {
    if (err instanceof SyntaxError) return await run();
    throw err;
  }
}

export async function anthropicText(
  model: string,
  apiKey: string,
  system: string,
  user: string
): Promise<string> {
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });
  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Keine Text-Antwort vom LLM (Anthropic)");
  }
  return block.text.trim();
}
