import { runWebResearch } from "@/lib/webResearch";
import type { WebResearchProviderId } from "@/lib/research/webResearchProviders";
import { callClaudeJSON } from "@/lib/claude";
import type { ResearchResult } from "@/lib/types";

export async function researchNische(
  nische: string,
  webProvider?: WebResearchProviderId
): Promise<ResearchResult & { webResearchSource?: string }> {
  const web = await runWebResearch(nische, webProvider);

  const profile = await callClaudeJSON<ResearchResult>(
    `Du bist Content-Strategie-Researcher für Social-Media-Video.`,
    `Nische: "${nische}"

Web-Recherche:
${web.snippets.join("\n\n")}

Erstelle ein Research-Profil für Video-Content in dieser Nische.`,
    `{
  "zielgruppe": "string",
  "painPoints": ["string", "string", "string"],
  "hookMuster": ["3-5 konkrete Hook-Muster"],
  "tonality": "optional string"
}`
  );

  return { ...profile, webResearchSource: web.source };
}
