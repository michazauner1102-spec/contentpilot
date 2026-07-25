import { callClaudeJSON } from "@/lib/claude";
import type { BereichGrouped, VideoWithInsights } from "@/lib/insights/types";
import type { Bereich, LoopLearnings } from "@/lib/types";

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function leadMetric(bereich: Bereich, v: VideoWithInsights): number {
  const m = v.metrics;
  switch (bereich) {
    case "reichweite":
      return m.completionRate * 0.5 + (m.views > 0 ? m.shares / m.views : 0) * 0.5;
    case "vertrauen":
      return m.views > 0 ? (m.saves + m.follows) / m.views : 0;
    case "conversion":
      return m.ctaRate * 0.6 + (m.views > 0 ? m.linkClicks / m.views : 0) * 0.4;
  }
}

function analyzeFrame(bereich: Bereich): string {
  switch (bereich) {
    case "reichweite":
      return "Linse: Hook-Retention-Payoff, Scroll-Stopping. Metriken: Views, Completion-Rate, Shares.";
    case "vertrauen":
      return "Linse: Know-Like-Trust, Social Proof. Metriken: Saves, Follows, Profilbesuche, Kommentare.";
    case "conversion":
      return "Linse: AIDA/BOFU, Hormozi Value Equation. Metriken: Link-Klicks, CTA-Rate, DMs, Bookings.";
  }
}

function summarizeBereich(
  bereich: Bereich,
  videos: VideoWithInsights[]
): string {
  if (videos.length === 0) {
    return "Keine Videos in diesem Bereich.";
  }
  const scores = videos.map((v) => ({
    video: v,
    score: leadMetric(bereich, v),
  }));
  const base = median(scores.map((s) => s.score));
  const over = scores.filter((s) => s.score >= base);
  const under = scores.filter((s) => s.score < base);

  const fmt = (items: typeof scores) =>
    items
      .slice(0, 5)
      .map(
        (s) =>
          `- ${s.video.title} (Tag ${s.video.postingDay}, ${s.video.format ?? "?"}): Score ${s.score.toFixed(3)}, Views ${s.video.metrics.views}`
      )
      .join("\n");

  return `Median-Score: ${base.toFixed(3)}

Über Median:
${fmt(over)}

Unter Median:
${fmt(under)}`;
}

export async function analyzeLoop(
  grouped: BereichGrouped
): Promise<LoopLearnings[]> {
  const bereiche: Bereich[] = ["reichweite", "vertrauen", "conversion"];
  const results: LoopLearnings[] = [];

  for (const bereich of bereiche) {
    const videos = grouped[bereich] ?? [];
    const summary = summarizeBereich(bereich, videos);

    const learning = await callClaudeJSON<LoopLearnings>(
      `Du bist Loop-Engineering-Analyst für Social-Media-Content.
Bewerte NUR Videos im Bereich "${bereich}" anhand der passenden Metriken.
Priorisiere: max 3 naechsteHebel (ICE/RICE-Gedanke), 2-4 konkrete Punkte pro Liste.
Keine generischen Floskeln.`,
      `${analyzeFrame(bereich)}

Daten:
${summary}

Video-Rohdaten:
${JSON.stringify(videos, null, 2)}`,
      `{
  "bereich": "${bereich}",
  "hatFunktioniert": ["2-4 strings"],
  "hatNichtFunktioniert": ["2-4 strings"],
  "naechsteHebel": ["max 3 priorisiert"]
}`
    );

    learning.bereich = bereich;
    learning.naechsteHebel = learning.naechsteHebel.slice(0, 3);
    results.push(learning);
  }

  return results;
}
