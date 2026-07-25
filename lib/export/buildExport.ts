import { BEREICH_LABELS } from "@/lib/types";
import type {
  ContentBriefing,
  CreatorReferenceSuggestion,
  ProductionGuide,
  ProgressEntry,
  ResearchResult,
  Zyklus,
} from "@/lib/types";
import type { BrainstormIdea } from "@/lib/brainstorm/contentPillars";
import { PILLAR_META, STATUS_LABELS } from "@/lib/brainstorm/contentPillars";

export interface ContentExportBundle {
  exportedAt: string;
  briefing: ContentBriefing | null;
  creatorSuggestion: CreatorReferenceSuggestion | null;
  brainstormIdeas?: BrainstormIdea[];
  research: (ResearchResult & { researchNotizen?: string }) | null;
  researchCycle: number;
  zyklus: Zyklus | null;
  productionGuide: ProductionGuide | null;
  progressLog: ProgressEntry[];
}

export function buildExportJson(bundle: ContentExportBundle): string {
  return JSON.stringify(bundle, null, 2);
}

export function buildExportMarkdown(bundle: ContentExportBundle): string {
  const lines: string[] = [];
  const b = bundle.briefing;

  lines.push("# ContentPilot — Export");
  lines.push("");
  lines.push(`> Exportiert: ${bundle.exportedAt}`);
  lines.push("");

  if (b) {
    lines.push("## Briefing");
    lines.push("");
    lines.push(`**Nische:** ${b.nische}`);
    lines.push(`**Präzisiert:** ${b.praezisierteNische}`);
    lines.push(`**Referent Creator:** ${b.referentCreator}`);
    lines.push("");
    lines.push(b.contentVision);
    lines.push("");
    lines.push("### Antworten (5 Fragen)");
    lines.push(`- Zielgruppe: ${b.answers.zielgruppeDetail}`);
    lines.push(`- 30-Tage-Ziel: ${b.answers.contentZiel30Tage}`);
    lines.push(`- Formate: ${b.answers.formatPraeferenz}`);
    lines.push(`- No-Gos: ${b.answers.noGos}`);
    lines.push(`- Zeit/Woche: ${b.answers.zeitBudgetProWoche}`);
    lines.push("");
  }

  const c = bundle.creatorSuggestion;
  if (c) {
    lines.push("## Creator-Referenz");
    lines.push("");
    lines.push(`**${c.creatorName}** — ${c.warumRelevant}`);
    lines.push("");
    lines.push("Übernehmbare Elemente:");
    for (const x of c.uebernehmbareElemente) lines.push(`- ${x}`);
    lines.push("");
    lines.push("Hook-Ideen:");
    for (const x of c.hookBeispiele) lines.push(`- ${x}`);
    lines.push("");
  }

  if (bundle.brainstormIdeas?.length) {
    lines.push("## Content Brainstorm");
    lines.push("");
    for (const idea of bundle.brainstormIdeas) {
      const pillar = PILLAR_META[idea.pillar]?.title ?? idea.pillar;
      lines.push(`### ${idea.title} (${pillar}) — ${STATUS_LABELS[idea.status]}`);
      lines.push(`- Hook: ${idea.hook}`);
      lines.push(`- SuperHook: ${idea.superhook}`);
      lines.push(`- Format: ${idea.format}`);
      lines.push("");
    }
  }

  if (bundle.research) {
    lines.push(`## Research (Zyklus ${bundle.researchCycle})`);
    lines.push("");
    lines.push(`**Zielgruppe:** ${bundle.research.zielgruppe}`);
    lines.push("");
    lines.push("**Pain Points:**");
    for (const p of bundle.research.painPoints) lines.push(`- ${p}`);
    lines.push("");
    lines.push("**Hook-Muster:**");
    for (const h of bundle.research.hookMuster) lines.push(`- ${h}`);
    if (bundle.research.tonality) {
      lines.push("");
      lines.push(`**Tonalität:** ${bundle.research.tonality}`);
    }
    if (bundle.research.researchNotizen) {
      lines.push("");
      lines.push(`_${bundle.research.researchNotizen}_`);
    }
    lines.push("");
  }

  if (bundle.zyklus) {
    lines.push("## 30-Tage-Plan");
    lines.push("");
    const sorted = [...bundle.zyklus.plan].sort(
      (a, b) => a.postingDay - b.postingDay
    );
    for (const v of sorted) {
      lines.push(
        `### Tag ${v.postingDay} · ${BEREICH_LABELS[v.bereich]} · ${v.format}`
      );
      lines.push("");
      lines.push(`**${v.title}**`);
      lines.push("");
      lines.push(`Hook: ${v.hook}`);
      lines.push("");
      lines.push(`_${v.begruendung}_`);
      lines.push("");
    }
  }

  const g = bundle.productionGuide;
  if (g) {
    lines.push("## Produktion & Posting");
    lines.push("");
    lines.push("### Video-Gestaltung");
    for (const x of g.videoGestaltung) lines.push(`- ${x}`);
    lines.push("");
    lines.push(`**Dreh-Rhythmus:** ${g.drehRhythmus}`);
    lines.push("");
    lines.push("**Posting-Zeiten:**");
    for (const t of g.postingZeiten) lines.push(`- ${t}`);
    lines.push("");
    lines.push(`**Batching:** ${g.batchingTipp}`);
    lines.push("");
    lines.push("### Wochenplan");
    for (const w of g.wochenplan) {
      lines.push(
        `- **Woche ${w.woche}** (${w.fokus}): Dreh ${w.drehTage.join(", ")} · Post-Tage ${w.postTage.join(", ")}`
      );
    }
    lines.push("");
  }

  if (bundle.progressLog.length) {
    lines.push("## Fortschritt");
    lines.push("");
    for (const p of bundle.progressLog) {
      lines.push(`- ${p.timestamp} · **${p.phase}:** ${p.message}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push("_Generiert mit ContentPilot_");
  return lines.join("\n");
}

/** Kompakt für Apple Notes / Plain-Text-Apps */
export function buildExportPlainText(bundle: ContentExportBundle): string {
  return buildExportMarkdown(bundle)
    .replace(/^#+ /gm, "")
    .replace(/\*\*/g, "")
    .replace(/^> /gm, "")
    .replace(/_/g, "");
}

export function exportFilename(
  briefing: ContentBriefing | null,
  ext: "md" | "json" | "txt"
): string {
  const slug = (briefing?.praezisierteNische || briefing?.nische || "contentpilot")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 40);
  const date = new Date().toISOString().slice(0, 10);
  return `contentpilot-${slug}-${date}.${ext}`;
}
