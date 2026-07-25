export type LoadingTaskId =
  | "generic"
  | "wizard"
  | "research"
  | "researchRefine"
  | "plan"
  | "script"
  | "planV2"
  | "performance"
  | "monthPlan"
  | "notion"
  | "brainstorm"
  | "trends";

export interface LoadingTaskMeta {
  label: string;
  hint: string;
  minSec: number;
  maxSec: number;
}

export const LOADING_TASKS: Record<LoadingTaskId, LoadingTaskMeta> = {
  generic: {
    label: "Bitte warten…",
    hint: "KI-Anfrage",
    minSec: 10,
    maxSec: 45,
  },
  wizard: {
    label: "Briefing wird erstellt",
    hint: "Creator-Analyse & 5 Fragen",
    minSec: 20,
    maxSec: 50,
  },
  research: {
    label: "Research läuft",
    hint: "Web-Recherche & Auswertung",
    minSec: 45,
    maxSec: 90,
  },
  researchRefine: {
    label: "Research wird angepasst",
    hint: "Feedback einarbeiten (ohne neue Web-Suche)",
    minSec: 15,
    maxSec: 45,
  },
  plan: {
    label: "30-Tage-Plan wird generiert",
    hint: "Videos, Mix & Produktions-Guide",
    minSec: 60,
    maxSec: 120,
  },
  script: {
    label: "Skript wird erstellt",
    hint: "Hook, Inhalt, CTA & Drehliste",
    minSec: 15,
    maxSec: 45,
  },
  planV2: {
    label: "Plan v2 wird erstellt",
    hint: "Learnings auswerten & neuen Monat planen",
    minSec: 90,
    maxSec: 180,
  },
  performance: {
    label: "Metriken werden geladen",
    hint: "Demo-Performance",
    minSec: 5,
    maxSec: 20,
  },
  monthPlan: {
    label: "Neuer Monatsplan",
    hint: "KI generiert Kalender",
    minSec: 60,
    maxSec: 120,
  },
  notion: {
    label: "Notion-Sync",
    hint: "Export vorbereiten",
    minSec: 10,
    maxSec: 40,
  },
  brainstorm: {
    label: "Brainstorm-Ideen",
    hint: "Säulen & Hooks",
    minSec: 20,
    maxSec: 60,
  },
  trends: {
    label: "Trend-Vorschläge",
    hint: "Web-Recherche & KI-Entwürfe",
    minSec: 20,
    maxSec: 55,
  },
};

export function formatLoadingEstimate(minSec: number, maxSec: number): string {
  if (minSec === maxSec) return `ca. ${minSec} Sek`;
  return `ca. ${minSec}–${maxSec} Sek`;
}
