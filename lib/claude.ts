import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-sonnet-4-20250514";

function extractJson(text: string): string {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const start = trimmed.indexOf("{");
  const arrStart = trimmed.indexOf("[");
  if (arrStart >= 0 && (start < 0 || arrStart < start)) {
    const end = trimmed.lastIndexOf("]");
    if (end > arrStart) return trimmed.slice(arrStart, end + 1);
  }
  if (start >= 0) {
    const end = trimmed.lastIndexOf("}");
    if (end > start) return trimmed.slice(start, end + 1);
  }
  return trimmed;
}

export async function callClaudeJSON<T>(
  system: string,
  user: string,
  schemaHint?: string
): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY ist nicht gesetzt");
  }

  const client = new Anthropic({ apiKey });
  const systemFull = schemaHint
    ? `${system}\n\nAntworte NUR mit validem JSON ohne Markdown. Schema:\n${schemaHint}`
    : `${system}\n\nAntworte NUR mit validem JSON ohne Markdown.`;

  const attempt = async (): Promise<T> => {
    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8192,
      system: systemFull,
      messages: [{ role: "user", content: user }],
    });

    const block = message.content.find((b) => b.type === "text");
    if (!block || block.type !== "text") {
      throw new Error("Keine Text-Antwort von Claude");
    }
    const jsonStr = extractJson(block.text);
    return JSON.parse(jsonStr) as T;
  };

  try {
    return await attempt();
  } catch (err) {
    if (err instanceof SyntaxError) {
      return await attempt();
    }
    throw err;
  }
}

export async function callClaudeText(system: string, user: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY ist nicht gesetzt");
  }

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 4096,
    system,
    messages: [{ role: "user", content: user }],
  });

  const block = message.content.find((b) => b.type === "text");
  if (!block || block.type !== "text") {
    throw new Error("Keine Text-Antwort von Claude");
  }
  return block.text.trim();
}
