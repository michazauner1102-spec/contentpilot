import { callClaudeJSON } from "@/lib/claude";
import { researchNische } from "@/lib/research";
import type { WebResearchProviderId } from "@/lib/research/webResearchProviders";
import type { ContentBriefing, ResearchResult } from "@/lib/types";

export async function researchWithBriefing(
  briefing: ContentBriefing,
  feedback?: string,
  cycle = 1,
  focus?: string[],
  brainstormIdeas?: import("@/lib/brainstorm/contentPillars").BrainstormIdea[],
  webProvider?: WebResearchProviderId
): Promise<
  ResearchResult & {
    researchNotizen: string;
    focusUsed?: string[];
    webResearchSource?: string;
  }
> {
  const base = await researchNische(
    briefing.praezisierteNische || briefing.nische,
    webProvider
  );
  const webResearchSource = base.webResearchSource;

  const focusNote = focus?.length
    ? `Fokus: ${focus.join(", ")}`
    : "Fokus: alle Bereiche";

  const brainstormNote = brainstormIdeas?.length
    ? `Brainstorm-Ideen:\n${brainstormIdeas
        .map(
          (i) =>
            `- [${i.pillar}] ${i.title} | Hook: ${i.hook} | SuperHook: ${i.superhook}`
        )
        .join("\n")}`
    : "";

  if (!feedback?.trim()) {
    return {
      ...base,
      researchNotizen: `Recherche-Zyklus ${cycle}. ${focusNote}${brainstormNote ? `\n${brainstormNote}` : ""}`,
      focusUsed: focus,
      webResearchSource,
    };
  }

  const enriched = await callClaudeJSON<
    ResearchResult & { researchNotizen: string }
  >(
    `Du aktualisierst Nischen-Research nach Human-Feedback.`,
    `Briefing:
${JSON.stringify(briefing, null, 2)}

Bisheriges Research:
${JSON.stringify(base, null, 2)}

Nutzer-Feedback (Human-in-the-Loop):
${feedback}

${brainstormNote}

Zyklus: ${cycle}
${focusNote}`,
    `{
  "zielgruppe": "string",
  "painPoints": ["string","string","string"],
  "hookMuster": ["string"],
  "tonality": "string",
  "researchNotizen": "Was sich geändert hat"
}`
  );

  return { ...enriched, webResearchSource };
}
