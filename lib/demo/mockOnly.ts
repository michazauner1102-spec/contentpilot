/**
 * Öffentliche Demo / GitHub-Klon: keine externen APIs, auch wenn Keys im Host gesetzt wären.
 * Aktiv bei NEXT_PUBLIC_DEMO_MODE oder FORCE_MOCK_ONLY=true.
 */
export function forceMockOnly(): boolean {
  return (
    process.env.FORCE_MOCK_ONLY === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}
