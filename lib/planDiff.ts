import type { VideoIdea } from "@/lib/types";

export interface PlanDiffSummary {
  headline: string;
  bullets: string[];
  bereichMixChange: string;
  hookChanges: number;
  formatChanges: number;
}

export function computePlanDiff(
  v1: VideoIdea[],
  v2: VideoIdea[]
): PlanDiffSummary {
  const v1ByDay = new Map(v1.map((v) => [v.postingDay, v]));
  let hookChanges = 0;
  let formatChanges = 0;
  let bereichChanges = 0;

  for (const v2Item of v2) {
    const v1Item = v1ByDay.get(v2Item.postingDay);
    if (!v1Item) continue;
    if (v1Item.hook.trim() !== v2Item.hook.trim()) hookChanges++;
    if (v1Item.format !== v2Item.format) formatChanges++;
    if (v1Item.bereich !== v2Item.bereich) bereichChanges++;
  }

  const mix = (ideas: VideoIdea[]) => {
    const c = { reichweite: 0, vertrauen: 0, conversion: 0 };
    for (const i of ideas) c[i.bereich]++;
    const t = ideas.length || 1;
    return {
      reichweite: Math.round((c.reichweite / t) * 100),
      vertrauen: Math.round((c.vertrauen / t) * 100),
      conversion: Math.round((c.conversion / t) * 100),
    };
  };

  const m1 = mix(v1);
  const m2 = mix(v2);

  const bullets: string[] = [
    `${hookChanges} Tage mit geändertem Hook`,
    `${formatChanges} Tage mit geändertem Format`,
    `${bereichChanges} Tage mit geändertem Bereich`,
  ];

  const sampleChanges = v2
    .filter((v2Item) => {
      const v1Item = v1ByDay.get(v2Item.postingDay);
      return v1Item && v1Item.hook !== v2Item.hook;
    })
    .slice(0, 3)
    .map(
      (v) =>
        `Tag ${v.postingDay}: neuer Hook „${v.hook.slice(0, 60)}${v.hook.length > 60 ? "…" : ""}"`
    );

  return {
    headline: "Plan v2 setzt Loop-Learnings sichtbar um",
    bullets: [...bullets, ...sampleChanges],
    bereichMixChange: `Mix v1 R${m1.reichweite}/V${m1.vertrauen}/C${m1.conversion} → v2 R${m2.reichweite}/V${m2.vertrauen}/C${m2.conversion}`,
    hookChanges,
    formatChanges,
  };
}
