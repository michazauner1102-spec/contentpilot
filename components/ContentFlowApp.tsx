"use client";

import { useCallback, useEffect, useState } from "react";
import {
  videoIdeaToMeta,
  type ContentBriefing,
  type CreatorReferenceSuggestion,
  type LoopAnalysisResult,
  type ProductionGuide,
  type ProgressEntry,
  type ResearchResult,
  type VideoDetails,
  type VideoIdea,
  type WizardAnswers,
  type Zyklus,
} from "@/lib/types";
import {
  WIZARD_QUESTIONS,
  hasWizardAnswer,
  type WizardAnswerKey,
} from "@/lib/onboarding/wizardQuestions";
import { WizardQuestionField } from "@/components/WizardQuestionField";
import {
  buildThemenBlocks,
  type ResearchFocusId,
  RESEARCH_FOCUS_OPTIONS,
} from "@/lib/research/themenBlocks";
import type { ResearchThemenBlock } from "@/lib/research/themenBlocks";
import type { BrainstormIdea } from "@/lib/brainstorm/contentPillars";
import type { BereichGrouped, VideoWithInsights } from "@/lib/insights/types";
import { computePlanDiff, type PlanDiffSummary } from "@/lib/planDiff";
import { DEMO_DIFF } from "@/lib/demo/mockData";
import { BTN_ACCENT, type AppMenuId } from "@/lib/ui/theme";
import { AppSidebar } from "@/components/shell/AppSidebar";
import { CalendarPage } from "@/components/account/CalendarPage";
import { TodosPage } from "@/components/account/TodosPage";
import { AccountEmpty } from "@/components/account/AccountScreen";
import { HumanLoopView } from "@/components/hitl/HumanLoopView";
import { MetricsDashboard } from "@/components/dashboard/MetricsDashboard";

type Phase =
  | "setup"
  | "wizard"
  | "briefing"
  | "brainstorm"
  | "research"
  | "plan"
  | "production"
  | "done";

const emptyAnswers: WizardAnswers = {
  zielgruppeDetail: "",
  contentZiel30Tage: "",
  formatPraeferenz: "",
  noGos: "",
  zeitBudgetProWoche: "",
};

const btnPrimary =
  "rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface)]";

const STORAGE_KEY = "contentpilot.flow.v1";

interface PersistedFlow {
  phase: Phase;
  menu: AppMenuId;
  nische: string;
  referentCreator: string;
  answers: WizardAnswers;
  creatorSuggestion: CreatorReferenceSuggestion | null;
  briefing: ContentBriefing | null;
  research: (ResearchResult & { researchNotizen?: string }) | null;
  researchCycle: number;
  researchThemen: ResearchThemenBlock[];
  brainstormIdeas: BrainstormIdea[];
  zyklus: Zyklus | null;
  productionGuide: ProductionGuide | null;
  progressLog: ProgressEntry[];
  recordedIds: string[];
  learnings: LoopAnalysisResult | null;
  planDiff: PlanDiffSummary | null;
  planVersion: 1 | 2;
}

function ts() {
  return new Date().toISOString().slice(0, 16).replace("T", " ");
}

export function ContentFlowApp() {
  const [menu, setMenu] = useState<AppMenuId>("calendar");
  const [showSetup, setShowSetup] = useState(false);
  const [phase, setPhase] = useState<Phase>("setup");
  const [nische, setNische] = useState("");
  const [referentCreator, setReferentCreator] = useState("");
  const [wizardStep, setWizardStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>(emptyAnswers);
  const [creatorSuggestion, setCreatorSuggestion] =
    useState<CreatorReferenceSuggestion | null>(null);
  const [briefing, setBriefing] = useState<ContentBriefing | null>(null);
  const [research, setResearch] = useState<
    (ResearchResult & { researchNotizen?: string }) | null
  >(null);
  const [researchCycle, setResearchCycle] = useState(1);
  const [researchFeedback, setResearchFeedback] = useState("");
  const [zyklus, setZyklus] = useState<Zyklus | null>(null);
  const [productionGuide, setProductionGuide] = useState<ProductionGuide | null>(
    null
  );
  const [progressLog, setProgressLog] = useState<ProgressEntry[]>([]);
  const [notionUrl, setNotionUrl] = useState<string | null>(null);
  const [notionPageId, setNotionPageId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoDetails | null>(null);
  const [researchFocus, setResearchFocus] = useState<ResearchFocusId[]>(
    RESEARCH_FOCUS_OPTIONS.map((o) => o.id)
  );
  const [researchThemen, setResearchThemen] = useState<ResearchThemenBlock[]>(
    []
  );
  const [brainstormIdeas, setBrainstormIdeas] = useState<BrainstormIdea[]>([]);
  const [performance, setPerformance] = useState<VideoWithInsights[]>([]);
  const [recordedIds, setRecordedIds] = useState<string[]>([]);
  const [learnings, setLearnings] = useState<LoopAnalysisResult | null>(null);
  const [learningsMock, setLearningsMock] = useState(false);
  const [planDiff, setPlanDiff] = useState<PlanDiffSummary | null>(null);
  const [planVersion, setPlanVersion] = useState<1 | 2>(1);
  const [planV2Loading, setPlanV2Loading] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const toggleRecorded = (id: string) =>
    setRecordedIds((ids) =>
      ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
    );

  // Hydration erst nach dem Mount, damit Server- und Client-Markup identisch bleiben.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<PersistedFlow>;
        if (s.phase) setPhase(s.phase);
        if (s.menu) {
          const m = s.menu as string;
          if (m === "account") setMenu("calendar");
          else if (
            m === "calendar" ||
            m === "todos" ||
            m === "hitl" ||
            m === "dashboard"
          )
            setMenu(m);
        }
        if (s.nische) setNische(s.nische);
        if (s.referentCreator) setReferentCreator(s.referentCreator);
        if (s.answers) setAnswers(s.answers);
        if (s.creatorSuggestion) setCreatorSuggestion(s.creatorSuggestion);
        if (s.briefing) setBriefing(s.briefing);
        if (s.research) setResearch(s.research);
        if (s.researchCycle) setResearchCycle(s.researchCycle);
        if (s.researchThemen) setResearchThemen(s.researchThemen);
        if (s.brainstormIdeas) setBrainstormIdeas(s.brainstormIdeas);
        if (s.zyklus) setZyklus(s.zyklus);
        if (s.productionGuide) setProductionGuide(s.productionGuide);
        if (s.progressLog) setProgressLog(s.progressLog);
        if (s.recordedIds) setRecordedIds(s.recordedIds);
        if (s.learnings) setLearnings(s.learnings);
        if (s.planDiff) setPlanDiff(s.planDiff);
        if (s.planVersion) setPlanVersion(s.planVersion);
      }
    } catch {
      /* beschädigter Stand wird ignoriert */
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated) return;
    const snapshot: PersistedFlow = {
      phase,
      menu,
      nische,
      referentCreator,
      answers,
      creatorSuggestion,
      briefing,
      research,
      researchCycle,
      researchThemen,
      brainstormIdeas,
      zyklus,
      productionGuide,
      progressLog,
      recordedIds,
      learnings,
      planDiff,
      planVersion,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      /* Quota o. Ä. — Demo läuft trotzdem weiter */
    }
  }, [
    hydrated,
    phase,
    menu,
    nische,
    referentCreator,
    answers,
    creatorSuggestion,
    briefing,
    research,
    researchCycle,
    researchThemen,
    brainstormIdeas,
    zyklus,
    productionGuide,
    progressLog,
    recordedIds,
    learnings,
    planDiff,
    planVersion,
  ]);

  const pushProgress = useCallback(
    (p: string, message: string) => {
      const entry: ProgressEntry = {
        timestamp: ts(),
        phase: p,
        message,
      };
      setProgressLog((prev) => [...prev, entry]);
      if (notionPageId) {
        fetch("/api/notion/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pageId: notionPageId, progressEntry: entry }),
        }).catch(() => {});
      }
    },
    [notionPageId]
  );

  const patchPlanVideo = useCallback((updated: VideoDetails) => {
    setZyklus((z) =>
      z
        ? { ...z, plan: z.plan.map((v) => (v.id === updated.id ? updated : v)) }
        : z
    );
    setSelectedVideo((cur) => (cur?.id === updated.id ? updated : cur));
  }, []);

  const loadVideoDetail = useCallback(
    async (video: VideoDetails) => {
      if (video.skript?.hook) return;
      setDetailLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/plan/detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            videoIdea: video,
            research: research ?? undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        patchPlanVideo(data as VideoDetails);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Skript konnte nicht geladen werden");
      } finally {
        setDetailLoading(false);
      }
    },
    [research, patchPlanVideo]
  );

  const importPerformance = useCallback(async () => {
    if (!zyklus) return;
    setLoading(true);
    setError(null);
    try {
      const demoPlatforms = [
        "instagram",
        "linkedin",
        "youtube",
        "tiktok",
      ] as const;
      const videos = zyklus.plan.map((v, i) => ({
        ...videoIdeaToMeta(v),
        platform: demoPlatforms[i % demoPlatforms.length],
      }));
      const res = await fetch("/api/performance/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videos }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPerformance(data.performance ?? []);
      pushProgress("Dashboard", "Performance-Testdaten importiert");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  }, [zyklus, pushProgress]);

  useEffect(() => {
    if (menu !== "dashboard" || !zyklus || performance.length > 0 || loading) {
      return;
    }
    void importPerformance();
  }, [menu, zyklus, performance.length, loading, importPerformance]);

  /** Loop schließen: Performance → Learnings → Plan v2 → zurück in den Kalender. */
  const generatePlanV2 = useCallback(async () => {
    if (!zyklus || performance.length === 0) return;
    setPlanV2Loading(true);
    setError(null);
    try {
      const grouped: BereichGrouped = {
        reichweite: [],
        vertrauen: [],
        conversion: [],
      };
      for (const v of performance) grouped[v.bereich].push(v);

      const loopRes = await fetch("/api/loop/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ performanceGroupedByBereich: grouped }),
      });
      const loopData = await loopRes.json();
      if (!loopRes.ok) throw new Error(loopData.error);
      const nextLearnings = loopData.learnings as LoopAnalysisResult;
      setLearnings(nextLearnings);
      setLearningsMock(Boolean(loopData.mock));
      pushProgress(
        "Loop",
        `Learnings aus ${performance.length} Videos abgeleitet`
      );

      const nische = briefing?.praezisierteNische || zyklus.nische;
      const planRes = await fetch("/api/plan/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nische,
          research: research ?? {
            zielgruppe: nische,
            painPoints: ["", "", ""],
            hookMuster: [],
          },
          referenzen: creatorSuggestion?.referenzVideos ?? [],
          learnings: nextLearnings,
          version: 2,
        }),
      });
      const planData = await planRes.json();
      if (!planRes.ok) throw new Error(planData.error);

      const v2Ideas = (planData.ideas ?? []) as VideoIdea[];
      setPlanDiff(
        v2Ideas.length
          ? computePlanDiff(zyklus.plan, v2Ideas)
          : { ...DEMO_DIFF, hookChanges: 0, formatChanges: 0 }
      );
      setZyklus({ ...(planData.zyklus as Zyklus), learnings: nextLearnings });
      setPlanVersion(2);
      // Neuer Zyklus: alte Auswahl, To-do-Haken und Metriken gehören zu Plan v1.
      setSelectedVideo(null);
      setRecordedIds([]);
      setPerformance([]);
      pushProgress("Loop", "Plan v2 übernommen — Kalender & To-dos aktualisiert");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Plan v2 fehlgeschlagen");
    } finally {
      setPlanV2Loading(false);
    }
  }, [zyklus, performance, briefing, research, creatorSuggestion, pushProgress]);

  const currentQuestion = WIZARD_QUESTIONS[wizardStep];
  const currentKey = currentQuestion?.id as WizardAnswerKey | undefined;

  const startWizard = () => {
    if (!nische.trim() || !referentCreator.trim()) {
      setError("Nische und Referent Creator angeben.");
      return;
    }
    setError(null);
    pushProgress("Setup", `Nische „${nische}“, Referent: ${referentCreator}`);
    setPhase("wizard");
  };

  const finishWizard = async () => {
    setLoading(true);
    setError(null);
    try {
      const cr = await fetch("/api/onboarding/creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nische, referentCreator }),
      });
      const crData = await cr.json();
      setCreatorSuggestion(crData.suggestion);

      const br = await fetch("/api/onboarding/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nische,
          referentCreator,
          answers,
          creatorSuggestion: crData.suggestion,
        }),
      });
      const brData = await br.json();
      setBriefing(brData.briefing);
      pushProgress("Wizard", "5 Fragen beantwortet, Briefing präzisiert");
      setPhase("briefing");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Wizard fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const runResearch = async (feedback?: string, cycle?: number) => {
    if (!briefing) return;
    setLoading(true);
    setError(null);
    const c = cycle ?? researchCycle;
    try {
      const res = await fetch("/api/onboarding/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefing,
          feedback,
          cycle: c,
          focus: researchFocus,
          brainstormIdeas: brainstormIdeas.filter(
            (i) => i.status === "freigegeben" || i.status === "entwurf"
          ),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResearch(data.research);
      setResearchThemen(
        data.themen ??
          buildThemenBlocks(
            data.research,
            briefing.praezisierteNische || briefing.nische
          )
      );
      setResearchCycle(data.cycle);
      pushProgress(
        "Research",
        feedback
          ? `Recherche-Zyklus ${data.cycle} nach Feedback aktualisiert`
          : `Recherche-Zyklus ${data.cycle} abgeschlossen`
      );
      setPhase("research");
      setMenu("hitl");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Research fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const approveAndPlan = async () => {
    if (!briefing || !research) return;
    setLoading(true);
    pushProgress("Freigabe", "Research freigegeben — Planung startet");
    try {
      const res = await fetch("/api/onboarding/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefing, research }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setZyklus(data.zyklus);
      setPerformance([]);
      setSelectedVideo(null);
      setLearnings(null);
      setPlanDiff(null);
      setPlanVersion(1);
      setPhase("plan");

      const g = await fetch("/api/production/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefing,
          ideas: data.zyklus.plan,
        }),
      });
      const gData = await g.json();
      setProductionGuide(gData.guide);
      pushProgress("Plan", "30-Tage-Plan und Produktions-Guide erstellt");
      setPhase("production");
      setShowSetup(false);
      setMenu("calendar");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Planung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const syncNotion = async () => {
    if (!briefing || !research || !zyklus) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notion/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          briefing,
          research,
          zyklus,
          productionGuide,
          progressLog,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setNotionUrl(data.url);
      setNotionPageId(data.pageId ?? null);
      pushProgress("Notion", data.mock ? "Demo-Sync (Keys fehlen)" : "Plan in Notion angelegt");
      setPhase("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Notion-Sync fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const researchThemenForBoard =
    research && researchThemen.length
      ? researchThemen
      : research && briefing
        ? buildThemenBlocks(
            research,
            briefing.praezisierteNische || nische
          )
        : [];

  const openSetup = () => {
    setError(null);
    setShowSetup(true);
  };

  const closeSetup = () => setShowSetup(false);

  const changeMenu = (id: AppMenuId) => {
    setError(null);
    setMenu(id);
    setShowSetup(false);
  };

  const resetFlow = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignorieren */
    }
    setPhase("setup");
    setMenu("calendar");
    setNische("");
    setReferentCreator("");
    setWizardStep(0);
    setAnswers(emptyAnswers);
    setCreatorSuggestion(null);
    setBriefing(null);
    setResearch(null);
    setResearchThemen([]);
    setResearchCycle(1);
    setResearchFeedback("");
    setBrainstormIdeas([]);
    setZyklus(null);
    setProductionGuide(null);
    setProgressLog([]);
    setPerformance([]);
    setRecordedIds([]);
    setLearnings(null);
    setLearningsMock(false);
    setPlanDiff(null);
    setPlanVersion(1);
    setSelectedVideo(null);
    setNotionUrl(null);
    setNotionPageId(null);
    setError(null);
    setShowSetup(false);
  };

  const planFertig = Boolean(zyklus);

  useEffect(() => {
    if (!showSetup && !selectedVideo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (selectedVideo) setSelectedVideo(null);
      else if (showSetup) closeSetup();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showSetup, selectedVideo]);

  const shellWide = menu === "dashboard";

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div
        className={`flex flex-col lg:flex-row gap-10 mx-auto px-6 py-10 ${
          shellWide ? "max-w-[min(100%,1800px)]" : "max-w-7xl"
        }`}
      >
        <AppSidebar
          active={menu}
          onChange={changeMenu}
          showOnboarding={Boolean(briefing || zyklus)}
          onOpenOnboarding={openSetup}
        />

        <div className="flex-1 min-w-0 relative min-h-[60vh] space-y-6">
          {error && (
            <p className="text-sm text-red-400/90 rounded-lg border border-red-900/40 bg-red-950/20 px-4 py-2">
              {error}
            </p>
          )}

          {menu === "calendar" &&
            (zyklus ? (
              <CalendarPage
                zyklus={zyklus}
                selectedVideo={selectedVideo}
                selectedDay={selectedVideo?.postingDay}
                onSelectVideo={setSelectedVideo}
                onCloseDetail={() => setSelectedVideo(null)}
                onLoadDetail={loadVideoDetail}
                detailLoading={detailLoading}
                planVersion={planVersion}
              />
            ) : (
              <AccountEmpty onStart={openSetup} />
            ))}

          {menu === "todos" &&
            (zyklus ? (
              <TodosPage
                zyklus={zyklus}
                productionGuide={productionGuide}
                onSelectDay={(v) => {
                  setSelectedVideo(v);
                  changeMenu("calendar");
                }}
                recordedIds={recordedIds}
                onToggleRecorded={toggleRecorded}
              />
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center space-y-4 max-w-lg">
                <h1 className="text-xl font-semibold">Noch keine To-dos</h1>
                <p className="text-sm text-[var(--muted)]">
                  Erst Plan freigeben — dann erscheinen hier Dreh-Wochen und die
                  Checkliste.
                </p>
                <button type="button" onClick={openSetup} className={btnPrimary}>
                  Plan-Setup starten
                </button>
              </div>
            ))}

          {menu === "hitl" && (
            <HumanLoopView
              phase={phase}
              briefing={briefing}
              research={research}
              researchThemen={researchThemenForBoard}
              researchCycle={researchCycle}
              researchFeedback={researchFeedback}
              onResearchFeedback={setResearchFeedback}
              researchFocus={researchFocus}
              onResearchFocus={setResearchFocus}
              onStartResearch={() => runResearch(undefined, 1)}
              onRerunResearch={() => {
                const next = researchCycle + 1;
                setResearchCycle(next);
                runResearch(researchFeedback, next);
              }}
              onApprovePlan={() => approveAndPlan()}
              loading={loading}
              brainstormIdeas={brainstormIdeas}
              onBrainstormIdeas={setBrainstormIdeas}
              onBrainstormContinue={() => {
                pushProgress(
                  "Brainstorm",
                  `${brainstormIdeas.length} Ideen im Board`
                );
                setPhase("research");
              }}
              creatorSuggestion={creatorSuggestion}
              zyklus={zyklus}
              productionGuide={productionGuide}
              progressLog={progressLog}
              onExportNotion={() => syncNotion()}
              notionUrl={notionUrl}
            />
          )}

          {menu === "dashboard" && (
            <MetricsDashboard
              performance={performance}
              onImportMock={zyklus ? () => importPerformance() : undefined}
              importing={loading}
              learnings={learnings}
              learningsMock={learningsMock}
              planDiff={planDiff}
              planVersion={planVersion}
              onGeneratePlanV2={zyklus ? () => generatePlanV2() : undefined}
              planV2Loading={planV2Loading}
            />
          )}

      {showSetup && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/60 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="setup-title"
          onClick={() => closeSetup()}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 space-y-6 my-6 sm:my-10 shadow-xl shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 id="setup-title" className="text-xl font-semibold">
                  Plan-Setup
                </h2>
                <p className="text-sm text-[var(--muted)] mt-1">
                  Nische, Fragen, Briefing — Brainstorm & Research unter Human in
                  the Loop. Du kannst jederzeit abbrechen und im Menü weiterarbeiten.
                </p>
              </div>
              <button
                type="button"
                onClick={() => closeSetup()}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] shrink-0"
              >
                Beenden & zum Menü
              </button>
            </div>

            {phase === "setup" && (
              <section className="space-y-4">
                <label className="block text-sm font-medium">Content-Nische</label>
                <input
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 bg-[var(--background)]"
                  placeholder="Personal Branding für Handwerker"
                  value={nische}
                  onChange={(e) => setNische(e.target.value)}
                />
                <label className="block text-sm font-medium">Referent Creator</label>
                <input
                  className="w-full rounded-lg border border-[var(--border)] px-3 py-2.5 bg-[var(--background)]"
                  placeholder="Creator, dessen Stil dich inspiriert"
                  value={referentCreator}
                  onChange={(e) => setReferentCreator(e.target.value)}
                />
                <button type="button" onClick={startWizard} className={BTN_ACCENT}>
                  Weiter zu 5 Fragen
                </button>
              </section>
            )}

            {phase === "wizard" && currentQuestion && currentKey && (
              <section className="space-y-4">
                <p className="text-sm text-[var(--muted)]">
                  Frage {wizardStep + 1} / {WIZARD_QUESTIONS.length}
                </p>
                <label className="block font-medium">{currentQuestion.label}</label>
                <WizardQuestionField
                  question={currentQuestion}
                  value={answers[currentKey]}
                  onChange={(v) => setAnswers((a) => ({ ...a, [currentKey]: v }))}
                  nische={nische}
                  referentCreator={referentCreator}
                />
                <div className="flex gap-2 flex-wrap">
                  {wizardStep > 0 && (
                    <button
                      type="button"
                      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
                      onClick={() => setWizardStep((s) => s - 1)}
                    >
                      Zurück
                    </button>
                  )}
                  {wizardStep < WIZARD_QUESTIONS.length - 1 ? (
                    <button
                      type="button"
                      className={btnPrimary}
                      disabled={!hasWizardAnswer(answers[currentKey])}
                      onClick={() => setWizardStep((s) => s + 1)}
                    >
                      Nächste Frage
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={BTN_ACCENT}
                      disabled={loading || !hasWizardAnswer(answers[currentKey])}
                      onClick={() => finishWizard()}
                    >
                      {loading ? "Auswerten…" : "Vorschläge & Briefing"}
                    </button>
                  )}
                </div>
              </section>
            )}

            {phase === "briefing" && briefing && (
              <section className="space-y-4">
                {creatorSuggestion && (
                  <article className="rounded-xl border border-[var(--border)] p-4 space-y-2 text-sm">
                    <h3 className="font-semibold">
                      Creator-Referenz: {creatorSuggestion.creatorName}
                    </h3>
                    <p>{creatorSuggestion.warumRelevant}</p>
                  </article>
                )}
                <article className="rounded-xl border border-[var(--border)] p-4 space-y-2">
                  <h3 className="font-semibold">Präzisiertes Briefing</h3>
                  <p className="text-sm">
                    <strong>Nische:</strong> {briefing.praezisierteNische}
                  </p>
                  <p className="text-sm text-[var(--muted)]">{briefing.contentVision}</p>
                  <button
                    type="button"
                    onClick={() => {
                      pushProgress("Briefing", "Weiter zum Content Brainstorm");
                      setPhase("brainstorm");
                      setShowSetup(false);
                      setMenu("hitl");
                    }}
                    className={BTN_ACCENT}
                  >
                    Weiter: Content Brainstorm
                  </button>
                </article>
              </section>
            )}

            {(phase === "brainstorm" ||
              phase === "research" ||
              planFertig) &&
              briefing && (
                <section className="space-y-4">
                  <article className="rounded-xl border border-[var(--border)] p-4 space-y-1 text-sm">
                    <p>
                      <strong>Nische:</strong> {briefing.praezisierteNische}
                    </p>
                    <p className="text-[var(--muted)]">
                      Referent: {briefing.referentCreator}
                    </p>
                  </article>
                  <p className="text-sm text-[var(--muted)]">
                    {planFertig
                      ? "Der Plan steht. Anpassungen laufen über Human in the Loop."
                      : "Brainstorm und Research findest du unter Human in the Loop."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={BTN_ACCENT}
                      onClick={() => {
                        setShowSetup(false);
                        changeMenu("hitl");
                      }}
                    >
                      Zu Human in the Loop
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
                      onClick={() => {
                        if (
                          confirm(
                            "Alles zurücksetzen? Briefing, Research und Plan gehen verloren."
                          )
                        ) {
                          resetFlow();
                        }
                      }}
                    >
                      Neu starten
                    </button>
                  </div>
                </section>
              )}
            <div className="pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => closeSetup()}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Setup beenden — zurück zum Menü (Esc)
              </button>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
