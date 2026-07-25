import { callClaudeJSON } from "@/lib/claude";
import type { ContentBriefing, ProductionGuide, VideoIdea } from "@/lib/types";

export async function generateProductionGuide(
  briefing: ContentBriefing,
  ideas: VideoIdea[]
): Promise<ProductionGuide> {
  return callClaudeJSON<ProductionGuide>(
    `Du bist Produktions-Coach für Social-Media-Video (Dreh, Schnitt, Posting).`,
    `Briefing:
${JSON.stringify(briefing, null, 2)}

Plan (Auszug):
${JSON.stringify(ideas.slice(0, 10), null, 2)}

Gib praktische Empfehlungen: Video-Gestaltung, wann drehen, wann posten, Batching.`,
    `{
  "videoGestaltung": ["string"],
  "drehRhythmus": "string",
  "postingZeiten": ["string"],
  "batchingTipp": "string",
  "wochenplan": [{ "woche": 1, "fokus": "string", "drehTage": ["Mo"], "postTage": [1,3,5] }]
}`
  );
}
