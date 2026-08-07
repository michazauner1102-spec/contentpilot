import type { AppMenuId } from "@/lib/ui/theme";
import type { ResearchThemenBlock } from "@/lib/research/themenBlocks";
import type { WebResearchProviderId } from "@/lib/research/webResearchProviders";
import type { BrainstormIdea } from "@/lib/brainstorm/contentPillars";
import type { PlanDiffSummary } from "@/lib/planDiff";
import type {
  ContentBriefing,
  CreatorReferenceSuggestion,
  LoopAnalysisResult,
  ProductionGuide,
  ProgressEntry,
  ResearchResult,
  WizardAnswers,
  Zyklus,
} from "@/lib/types";

export type FlowPhase =
  | "setup"
  | "wizard"
  | "briefing"
  | "brainstorm"
  | "research"
  | "plan"
  | "production"
  | "done";

/** Vollständiger Arbeitsstand eines Plans — liegt serverseitig als JSON am Workspace. */
export interface PersistedFlow {
  phase: FlowPhase;
  menu: AppMenuId;
  nische: string;
  referentCreator: string;
  answers: WizardAnswers;
  creatorSuggestion: CreatorReferenceSuggestion | null;
  briefing: ContentBriefing | null;
  research: (ResearchResult & { researchNotizen?: string }) | null;
  researchCycle: number;
  researchThemen: ResearchThemenBlock[];
  researchWebProvider?: WebResearchProviderId;
  brainstormIdeas: BrainstormIdea[];
  calendars: Zyklus[];
  activeCalendarId: string | null;
  zyklus: Zyklus | null;
  productionGuide: ProductionGuide | null;
  progressLog: ProgressEntry[];
  recordedIds: string[];
  learnings: LoopAnalysisResult | null;
  planDiff: PlanDiffSummary | null;
  planVersion: 1 | 2;
}

/** Ein „Account" im UI = ein Plan/Workspace des eingeloggten Users. */
export interface AccountMeta {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/** Stand aus der Zeit vor den Server-Accounts — wird beim Registrieren übernommen. */
export const LEGACY_FLOW_STORAGE_KEY = "contentpilot.flow.v1";

export function deriveAccountName(flow: Partial<PersistedFlow>): string {
  const fromBriefing =
    flow.briefing?.praezisierteNische?.trim() || flow.briefing?.nische?.trim();
  if (fromBriefing) return fromBriefing.slice(0, 60);
  const fromNische = flow.nische?.trim();
  if (fromNische) return fromNische.slice(0, 60);
  const monat = flow.zyklus?.monat ?? flow.calendars?.[0]?.monat;
  if (monat) return `Plan ${monat}`;
  return "Neuer Plan";
}

export function emptyPersistedFlow(): PersistedFlow {
  return {
    phase: "setup",
    menu: "calendar",
    nische: "",
    referentCreator: "",
    answers: {
      zielgruppeDetail: "",
      contentZiel30Tage: "",
      formatPraeferenz: "",
      noGos: "",
      zeitBudgetProWoche: "",
    },
    creatorSuggestion: null,
    briefing: null,
    research: null,
    researchCycle: 1,
    researchThemen: [],
    researchWebProvider: "auto",
    brainstormIdeas: [],
    calendars: [],
    activeCalendarId: null,
    zyklus: null,
    productionGuide: null,
    progressLog: [],
    recordedIds: [],
    learnings: null,
    planDiff: null,
    planVersion: 1,
  };
}
