/** Client-sicher: keine LLM-Imports. */
export function buildZyklusId(nische: string, version: number): string {
  const slug = nische.toLowerCase().replace(/\s+/g, "-").slice(0, 24);
  return `${slug}-v${version}-${Date.now()}`;
}
