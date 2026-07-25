import { parseWebResearchProvider } from "@/lib/research/webResearchProviders";
import type { AppMenuId } from "@/lib/ui/theme";
import type { PersistedFlow, FlowPhase } from "@/lib/accounts/flowPersistence";
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

export interface FlowStateSetters {
  setPhase: (p: FlowPhase) => void;
  setMenu: (m: AppMenuId) => void;
  setNische: (v: string) => void;
  setReferentCreator: (v: string) => void;
  setAnswers: (a: WizardAnswers) => void;
  setCreatorSuggestion: (v: CreatorReferenceSuggestion | null) => void;
  setBriefing: (v: ContentBriefing | null) => void;
  setResearch: (
    v: (ResearchResult & { researchNotizen?: string }) | null
  ) => void;
  setResearchCycle: (n: number) => void;
  setResearchThemen: (t: ResearchThemenBlock[]) => void;
  setResearchWebProvider: (p: WebResearchProviderId) => void;
  setBrainstormIdeas: (i: BrainstormIdea[]) => void;
  setCalendars: (c: Zyklus[]) => void;
  setActiveCalendarId: (id: string | null) => void;
  setProductionGuide: (g: ProductionGuide | null) => void;
  setProgressLog: (l: ProgressEntry[]) => void;
  setRecordedIds: (ids: string[]) => void;
  setLearnings: (l: LoopAnalysisResult | null) => void;
  setPlanDiff: (d: PlanDiffSummary | null) => void;
  setPlanVersion: (v: 1 | 2) => void;
  setResearchFeedback: (v: string) => void;
  setWizardStep: (n: number) => void;
  setPerformance: (p: import("@/lib/insights/types").VideoWithInsights[]) => void;
  setLearningsMock: (b: boolean) => void;
  setPlanImportLabel: (l: string | null) => void;
  setSelectedVideo: (v: import("@/lib/types").VideoDetails | null) => void;
  setNotionUrl: (u: string | null) => void;
  setNotionPageId: (id: string | null) => void;
  setError: (e: string | null) => void;
  setShowSetup: (b: boolean) => void;
}

export function applyPersistedFlow(
  s: Partial<PersistedFlow>,
  set: FlowStateSetters
): void {
  if (s.phase) set.setPhase(s.phase);
  if (s.menu) {
    const m = s.menu as string;
    if (m === "account") set.setMenu("calendar");
    else if (
      m === "calendar" ||
      m === "todos" ||
      m === "hitl" ||
      m === "dashboard"
    ) {
      set.setMenu(m);
    }
  }
  set.setNische(s.nische ?? "");
  set.setReferentCreator(s.referentCreator ?? "");
  set.setAnswers(s.answers ?? {
    zielgruppeDetail: "",
    contentZiel30Tage: "",
    formatPraeferenz: "",
    noGos: "",
    zeitBudgetProWoche: "",
  });
  set.setCreatorSuggestion(s.creatorSuggestion ?? null);
  set.setBriefing(s.briefing ?? null);
  set.setResearch(s.research ?? null);
  set.setResearchCycle(s.researchCycle ?? 1);
  set.setResearchThemen(s.researchThemen ?? []);
  if (s.researchWebProvider) {
    set.setResearchWebProvider(parseWebResearchProvider(s.researchWebProvider));
  } else {
    set.setResearchWebProvider("auto");
  }
  set.setBrainstormIdeas(s.brainstormIdeas ?? []);
  if (Array.isArray(s.calendars) && s.calendars.length > 0) {
    set.setCalendars(s.calendars);
    set.setActiveCalendarId(
      s.activeCalendarId ?? s.calendars[s.calendars.length - 1]?.id ?? null
    );
  } else if (s.zyklus) {
    set.setCalendars([s.zyklus]);
    set.setActiveCalendarId(s.zyklus.id);
  } else {
    set.setCalendars([]);
    set.setActiveCalendarId(null);
  }
  set.setProductionGuide(s.productionGuide ?? null);
  set.setProgressLog(s.progressLog ?? []);
  set.setRecordedIds(s.recordedIds ?? []);
  set.setLearnings(s.learnings ?? null);
  set.setPlanDiff(s.planDiff ?? null);
  set.setPlanVersion(s.planVersion ?? 1);

  set.setResearchFeedback("");
  set.setWizardStep(0);
  set.setPerformance([]);
  set.setLearningsMock(false);
  set.setPlanImportLabel(null);
  set.setSelectedVideo(null);
  set.setNotionUrl(null);
  set.setNotionPageId(null);
  set.setError(null);
  set.setShowSetup(false);
}
