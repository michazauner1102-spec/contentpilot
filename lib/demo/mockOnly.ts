/**
 * Server blockiert externe APIs nur bei FORCE_MOCK_ONLY (öffentliche Demo).
 * NEXT_PUBLIC_DEMO_MODE steuert nur das UI-Banner — nicht den LLM-Betrieb.
 */
export function forceMockOnly(): boolean {
  return process.env.FORCE_MOCK_ONLY === "true";
}
