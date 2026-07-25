import { getLlmConfig, isLlmConfigured } from "./config";
import { anthropicJson, anthropicText } from "./providers/anthropic";
import { geminiJson, geminiText } from "./providers/gemini";
import { openaiJson, openaiText } from "./providers/openai";

export { getLlmConfig, isLlmConfigured, llmConfiguredLabel } from "./config";

function assertLlmReady(): void {
  if (!isLlmConfigured()) {
    const { provider } = getLlmConfig();
    const hint =
      provider === "gemini"
        ? "GOOGLE_GENERATIVE_AI_API_KEY oder GEMINI_API_KEY"
        : provider === "openai"
          ? "OPENAI_API_KEY"
          : "ANTHROPIC_API_KEY";
    throw new Error(`LLM nicht konfiguriert (${provider}). Setze ${hint}.`);
  }
}

export async function callLLMJSON<T>(
  system: string,
  user: string,
  schemaHint?: string
): Promise<T> {
  assertLlmReady();
  const { provider, model } = getLlmConfig();

  switch (provider) {
    case "anthropic":
      return anthropicJson<T>(
        model,
        process.env.ANTHROPIC_API_KEY!,
        system,
        user,
        schemaHint
      );
    case "gemini":
      return geminiJson<T>(model, system, user, schemaHint);
    case "openai":
      return openaiJson<T>(
        model,
        process.env.OPENAI_API_KEY!,
        system,
        user,
        schemaHint
      );
  }
}

export async function callLLMText(system: string, user: string): Promise<string> {
  assertLlmReady();
  const { provider, model } = getLlmConfig();

  switch (provider) {
    case "anthropic":
      return anthropicText(model, process.env.ANTHROPIC_API_KEY!, system, user);
    case "gemini":
      return geminiText(model, system, user);
    case "openai":
      return openaiText(model, process.env.OPENAI_API_KEY!, system, user);
  }
}

/** @deprecated Alias — nutze callLLMJSON */
export const callClaudeJSON = callLLMJSON;

/** @deprecated Alias — nutze callLLMText */
export const callClaudeText = callLLMText;
