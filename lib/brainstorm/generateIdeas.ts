import { isLlmConfigured, callClaudeJSON } from "@/lib/llm";
import type { ContentBriefing } from "@/lib/types";
import type { BrainstormIdea, ContentPillar } from "./contentPillars";
import { PILLAR_META } from "./contentPillars";

export function mockBrainstormIdeas(nische: string): BrainstormIdea[] {
  const mk = (
    pillar: ContentPillar,
    title: string,
    hook: string,
    superhook: string,
    format: string
  ): BrainstormIdea => ({
    id: `mock-${pillar}-${Math.random().toString(36).slice(2, 8)}`,
    pillar,
    title,
    hook,
    superhook,
    format,
    status: "idee",
  });

  return [
    mk(
      "attention",
      `Trend-Hook: ${nische}`,
      "Was fast alle in deiner Nische falsch machen (und du nicht).",
      "Seit 18 Monaten teste ich das mit Kund:innen — hier die Kurzfassung.",
      "Talking Head + Text-Overlay"
    ),
    mk(
      "attention",
      "Vorher-Nachher",
      "So sah mein Content aus — und so performt er jetzt.",
      "Über 200 Videos in dieser Nische ausgewertet.",
      "Reel, Schnitt alle 2s"
    ),
    mk(
      "personal",
      "BTS Drehtag",
      "Ein normaler Dienstag — so entsteht bei uns ein Video.",
      "Kein Studio, nur Handy + 45 Minuten.",
      "Vlog / B-Roll"
    ),
    mk(
      "value",
      "FAQ #1",
      "Die Frage, die uns jede Woche erreicht …",
      "Wir haben 50+ Anfragen so beantwortet — funktioniert.",
      "Tutorial / FAQ"
    ),
    mk(
      "value",
      "Mythen vs. Realität",
      `3 Mythen über ${nische}, die dich bremsen.`,
      "Basierend auf Projekten mit echten Zahlen — ohne Buzzwords.",
      "Karussell oder Talking Head"
    ),
  ];
}

export async function generateBrainstormIdeas(
  briefing: ContentBriefing,
  countPerPillar = 2
): Promise<BrainstormIdea[]> {
  const nische = briefing.praezisierteNische || briefing.nische;
  const pillars = Object.entries(PILLAR_META).map(([key, meta]) => ({
    pillar: key,
    ...meta,
  }));

  if (!isLlmConfigured()) {
    return mockBrainstormIdeas(nische);
  }

  try {
    const result = await callClaudeJSON<{ ideas: BrainstormIdea[] }>(
      `Du bist Content-Strategie-Brainstormer. Erstelle Video-Ideen in drei Säulen:
- attention (Reichweite)
- personal (Nähe)
- value (Autorität)
Jede Idee braucht title, hook, superhook (Social Proof Satz 2), format, status "idee". Superhook in ~80% der Ideen stark ausprägen.`,
      `Briefing:
${JSON.stringify(briefing, null, 2)}

Säulen:
${JSON.stringify(pillars, null, 2)}

Erzeuge je ${countPerPillar} Ideen pro Säule (${countPerPillar * 3} total). Deutsch.`,
      `{ "ideas": [{ "id", "pillar": "attention|personal|value", "title", "hook", "superhook", "format", "status": "idee" }] }`
    );
    return result.ideas.map((idea, i) => ({
      ...idea,
      id: idea.id || `gen-${i}`,
      status: "idee" as const,
    }));
  } catch {
    return mockBrainstormIdeas(nische);
  }
}
