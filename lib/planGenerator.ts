import { callClaudeJSON } from "@/lib/claude";
import {
  DEFAULT_BEREICH_MIX,
  type Bereich,
  type LoopAnalysisResult,
  type PlanGenerateInput,
  type PlanGenerateOutput,
  type ReferenzVideo,
  type ResearchResult,
  type VideoIdea,
  type VideoFormat,
  type Platform,
} from "@/lib/types";

const TARGET_COUNTS: Record<Bereich, number> = {
  reichweite: 18,
  vertrauen: 8,
  conversion: 4,
};

function computeMix(ideas: VideoIdea[]): Record<Bereich, number> {
  const counts: Record<Bereich, number> = {
    reichweite: 0,
    vertrauen: 0,
    conversion: 0,
  };
  for (const idea of ideas) counts[idea.bereich]++;
  const total = ideas.length || 1;
  return {
    reichweite: counts.reichweite / total,
    vertrauen: counts.vertrauen / total,
    conversion: counts.conversion / total,
  };
}

function mixValid(ideas: VideoIdea[]): boolean {
  const counts: Record<Bereich, number> = {
    reichweite: 0,
    vertrauen: 0,
    conversion: 0,
  };
  for (const idea of ideas) counts[idea.bereich]++;
  return (
    Math.abs(counts.reichweite - TARGET_COUNTS.reichweite) <= 2 &&
    Math.abs(counts.vertrauen - TARGET_COUNTS.vertrauen) <= 2 &&
    Math.abs(counts.conversion - TARGET_COUNTS.conversion) <= 2
  );
}

function learningsBlock(learnings?: LoopAnalysisResult): string {
  if (!learnings?.length) return "";
  return learnings
    .map(
      (l) =>
        `Bereich ${l.bereich}:
- Hebel (priorisiert): ${l.naechsteHebel.join("; ")}
- Funktioniert: ${l.hatFunktioniert.join("; ")}
- Nicht funktioniert: ${l.hatNichtFunktioniert.join("; ")}`
    )
    .join("\n\n");
}

async function generateOnce(
  input: PlanGenerateInput,
  attempt: number
): Promise<VideoIdea[]> {
  const { nische, research, referenzen, learnings, briefing } = input;
  const mix = input.bereichMix ?? DEFAULT_BEREICH_MIX;

  const result = await callClaudeJSON<{ ideas: VideoIdea[] }>(
    `Du bist ContentPilot, ein 30-Tage-Video-Planer für Social Media.
Jedes Video hat GENAU einen Bereich: reichweite | vertrauen | conversion.
Formate: talking_head, tutorial, story, b_roll.
Plattformen: instagram, youtube, tiktok.
Mix-Ziel: Reichweite ${Math.round(mix.reichweite * 100)}%, Vertrauen ${Math.round(mix.vertrauen * 100)}%, Conversion ${Math.round(mix.conversion * 100)}%.
Exakte Zielanzahl: 18 Reichweite, 8 Vertrauen, 4 Conversion (30 Videos total).
postingDay muss 1-30 sein, jeder Tag genau ein Video.`,
    `Nische: ${nische}
Versuch: ${attempt}

Research:
${JSON.stringify(research, null, 2)}

Referenzvideos:
${JSON.stringify(referenzen.slice(0, 8), null, 2)}

${learningsBlock(learnings) ? `LOOP-LEARNINGS (verbindlich umsetzen, Hebel zuerst):\n${learningsBlock(learnings)}` : ""}

${briefing ? `CONTENT-BRIEFING (verbindlich):\n${JSON.stringify(briefing, null, 2)}` : ""}

Erzeuge 30 VideoIdea-Objekte mit eindeutigen ids (z.B. v1-day-01).`,
    `{ "ideas": [{ "id", "title", "hook", "bereich", "format", "platform", "postingDay", "begruendung" }] }`
  );

  return result.ideas
    .sort((a, b) => a.postingDay - b.postingDay)
    .slice(0, 30);
}

export async function generatePlan(
  input: PlanGenerateInput
): Promise<PlanGenerateOutput> {
  let ideas = await generateOnce(input, 1);
  if (!mixValid(ideas)) {
    ideas = await generateOnce(input, 2);
  }
  if (!mixValid(ideas)) {
    ideas = rebalanceMix(ideas);
  }
  return {
    ideas,
    bereichMix: computeMix(ideas),
  };
}

function rebalanceMix(ideas: VideoIdea[]): VideoIdea[] {
  const sorted = [...ideas].sort((a, b) => a.postingDay - b.postingDay);
  const counts = { reichweite: 0, vertrauen: 0, conversion: 0 };
  for (const idea of sorted) counts[idea.bereich]++;

  const need: Record<Bereich, number> = {
    reichweite: TARGET_COUNTS.reichweite - counts.reichweite,
    vertrauen: TARGET_COUNTS.vertrauen - counts.vertrauen,
    conversion: TARGET_COUNTS.conversion - counts.conversion,
  };

  const surplus: Bereich[] = [];
  const deficit: Bereich[] = [];
  (Object.keys(need) as Bereich[]).forEach((b) => {
    if (need[b] < 0) for (let i = 0; i < -need[b]; i++) surplus.push(b);
    if (need[b] > 0) for (let i = 0; i < need[b]; i++) deficit.push(b);
  });

  for (let i = 0; i < surplus.length && deficit.length; i++) {
    const from = surplus[i];
    const to = deficit.shift();
    if (!to) break;
    const candidate = sorted.find((v) => v.bereich === from);
    if (candidate) candidate.bereich = to;
  }

  return sorted;
}

export { buildZyklusId } from "@/lib/plan/zyklusId";

export type { ResearchResult, ReferenzVideo, VideoFormat, Platform };
