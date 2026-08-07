/** Ein echter, selbst gesetzter LLM-Zugang — Keys oder die lokale claude CLI. */
export function hasExplicitLlmAccess(): boolean {
  const keys = [
    process.env.ANTHROPIC_API_KEY,
    process.env.OPENAI_API_KEY,
    process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    process.env.GEMINI_API_KEY,
  ];
  if (keys.some((k) => k?.trim())) return true;
  return process.env.LLM_PROVIDER?.trim().toLowerCase() === "claude-cli";
}

/**
 * Mock-Betrieb für die öffentliche Demo (Render ohne Keys).
 *
 * Sobald ein eigener Key in .env.local steht, läuft echte KI — man muss
 * FORCE_MOCK_ONLY nicht zusätzlich umstellen. Wer den Mock erzwingen will,
 * setzt FORCE_MOCK_ONLY=strict.
 */
export function forceMockOnly(): boolean {
  const flag = process.env.FORCE_MOCK_ONLY?.trim().toLowerCase();
  if (flag === "strict") return true;
  if (flag !== "true") return false;
  return !hasExplicitLlmAccess();
}
