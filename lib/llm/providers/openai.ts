import { extractJson, jsonSystemPrompt } from "../extractJson";

async function openaiChat(
  model: string,
  apiKey: string,
  system: string,
  user: string
): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 8192,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("Keine Text-Antwort vom LLM (OpenAI)");
  return text;
}

export async function openaiJson<T>(
  model: string,
  apiKey: string,
  system: string,
  user: string,
  schemaHint?: string
): Promise<T> {
  const systemFull = jsonSystemPrompt(system, schemaHint);
  const run = async () =>
    JSON.parse(extractJson(await openaiChat(model, apiKey, systemFull, user))) as T;
  try {
    return await run();
  } catch (err) {
    if (err instanceof SyntaxError) return await run();
    throw err;
  }
}

export async function openaiText(
  model: string,
  apiKey: string,
  system: string,
  user: string
): Promise<string> {
  return (await openaiChat(model, apiKey, system, user)).trim();
}
