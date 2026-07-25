export type LlmProviderId = "anthropic" | "gemini" | "openai" | "claude-cli";

import { forceMockOnly } from "@/lib/demo/mockOnly";

export interface LlmConfig {
  provider: LlmProviderId;
  model: string;
}

export function getLlmConfig(): LlmConfig {
  const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase() as LlmProviderId;
  if (
    provider !== "anthropic" &&
    provider !== "gemini" &&
    provider !== "openai" &&
    provider !== "claude-cli"
  ) {
    throw new Error(
      `LLM_PROVIDER ungültig: ${provider}. Erlaubt: anthropic, gemini, openai, claude-cli`
    );
  }

  const defaults: Record<LlmProviderId, string> = {
    anthropic: "claude-sonnet-4-20250514",
    gemini: "gemini-2.0-flash",
    openai: "gpt-4o-mini",
    "claude-cli": "sonnet",
  };

  const model =
    process.env.LLM_MODEL?.trim() ||
    process.env.ANTHROPIC_MODEL?.trim() ||
    process.env.GEMINI_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    defaults[provider];

  return { provider, model };
}

export function isLlmConfigured(): boolean {
  if (forceMockOnly()) return false;
  const { provider } = getLlmConfig();
  switch (provider) {
    case "claude-cli":
      // Nutzt die lokale, per Abo eingeloggte `claude` CLI — kein Key nötig.
      return true;
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    case "gemini":
      return Boolean(
        process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
          process.env.GEMINI_API_KEY?.trim()
      );
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY?.trim());
    default:
      return false;
  }
}

export function llmConfiguredLabel(): string {
  if (!isLlmConfigured()) return "kein LLM-Key";
  const { provider, model } = getLlmConfig();
  return `${provider} (${model})`;
}
