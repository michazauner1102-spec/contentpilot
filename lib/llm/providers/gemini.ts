import { extractJson, jsonSystemPrompt } from "../extractJson";

function geminiApiKey(): string {
  const key =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY oder GEMINI_API_KEY ist nicht gesetzt"
    );
  }
  return key;
}

async function geminiGenerate(
  model: string,
  system: string,
  user: string
): Promise<string> {
  const key = geminiApiKey();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 8192 },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Keine Text-Antwort vom LLM (Gemini)");
  return text;
}

export async function geminiJson<T>(
  model: string,
  system: string,
  user: string,
  schemaHint?: string
): Promise<T> {
  const systemFull = jsonSystemPrompt(system, schemaHint);
  const run = async () =>
    JSON.parse(extractJson(await geminiGenerate(model, systemFull, user))) as T;
  try {
    return await run();
  } catch (err) {
    if (err instanceof SyntaxError) return await run();
    throw err;
  }
}

export async function geminiText(
  model: string,
  system: string,
  user: string
): Promise<string> {
  return (await geminiGenerate(model, system, user)).trim();
}
