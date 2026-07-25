import { forceMockOnly } from "@/lib/demo/mockOnly";
import { isLlmConfigured, llmConfiguredLabel } from "@/lib/llm";

/** Echte KI-Aufrufe erlaubt (kein FORCE_MOCK_ONLY + LLM-Key gesetzt). */
export function liveAiEnabled(): boolean {
  return !forceMockOnly() && isLlmConfigured();
}

export function liveAiStatus(): {
  forceMockOnly: boolean;
  llmConfigured: boolean;
  liveAiEnabled: boolean;
  label: string;
} {
  const mock = forceMockOnly();
  const llm = isLlmConfigured();
  return {
    forceMockOnly: mock,
    llmConfigured: llm,
    liveAiEnabled: !mock && llm,
    label: llmConfiguredLabel(),
  };
}

export function liveAiErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
