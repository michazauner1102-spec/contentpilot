"use client";

import { BrainstormBoard } from "@/components/BrainstormBoard";
import { ResearchBoard } from "@/components/ResearchBoard";
import { ExportPanel } from "@/components/ExportPanel";
import { PipelineStrip } from "@/components/PipelineStrip";
import type { ResearchThemenBlock } from "@/lib/research/themenBlocks";
import type { ResearchFocusId } from "@/lib/research/themenBlocks";
import type { BrainstormIdea } from "@/lib/brainstorm/contentPillars";
import type {
  ContentBriefing,
  CreatorReferenceSuggestion,
  ProductionGuide,
  ProgressEntry,
  ResearchResult,
  Zyklus,
} from "@/lib/types";

interface HumanLoopViewProps {
  phase: string;
  briefing: ContentBriefing | null;
  research: (ResearchResult & { researchNotizen?: string }) | null;
  researchThemen: ResearchThemenBlock[];
  researchCycle: number;
  researchFeedback: string;
  onResearchFeedback: (v: string) => void;
  researchFocus: ResearchFocusId[];
  onResearchFocus: (f: ResearchFocusId[]) => void;
  onStartResearch: () => void;
  onRerunResearch: () => void;
  onApprovePlan: () => void;
  loading: boolean;
  brainstormIdeas: BrainstormIdea[];
  onBrainstormIdeas: (ideas: BrainstormIdea[]) => void;
  onBrainstormContinue?: () => void;
  creatorSuggestion: CreatorReferenceSuggestion | null;
  zyklus: Zyklus | null;
  productionGuide: ProductionGuide | null;
  progressLog: ProgressEntry[];
  onExportNotion?: () => void;
  notionUrl?: string | null;
}

export function HumanLoopView(props: HumanLoopViewProps) {
  const showResearch = props.briefing && (props.phase === "research" || props.research);

  return (
    <div className="space-y-10 max-w-3xl">
      <header className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Human in the Loop</h1>
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          Research anpassen, Brainstorm pflegen, Plan freigeben und exportieren.
        </p>
        <PipelineStrip phase={props.phase} />
      </header>

      {props.briefing && (
        <BrainstormBoard
          briefing={props.briefing}
          ideas={props.brainstormIdeas}
          onIdeasChange={props.onBrainstormIdeas}
          loading={props.loading}
          onContinue={
            props.onBrainstormContinue ??
            (() => {
              if (!props.research) props.onStartResearch();
            })
          }
        />
      )}

      {showResearch && props.briefing && (
        <ResearchBoard
          research={
            props.research ?? {
              zielgruppe: "",
              painPoints: ["", "", ""] as [string, string, string],
              hookMuster: [],
            }
          }
          themen={props.researchThemen}
          cycle={props.researchCycle}
          loading={props.loading}
          feedback={props.researchFeedback}
          onFeedbackChange={props.onResearchFeedback}
          onRerun={props.onRerunResearch}
          onApprove={props.onApprovePlan}
          focus={props.researchFocus}
          onFocusChange={props.onResearchFocus}
          onStartResearch={props.onStartResearch}
          showStart={!props.research}
        />
      )}

      {!props.briefing && (
        <p className="text-sm text-[var(--muted)]">
          Zuerst Plan-Setup unter Account abschließen (mindestens bis Briefing).
        </p>
      )}

      {props.zyklus && (
        <ExportPanel
          briefing={props.briefing}
          creatorSuggestion={props.creatorSuggestion}
          brainstormIdeas={props.brainstormIdeas}
          research={props.research}
          researchCycle={props.researchCycle}
          zyklus={props.zyklus}
          productionGuide={props.productionGuide}
          progressLog={props.progressLog}
          onNotionSync={props.onExportNotion}
          notionSyncLoading={props.loading}
          notionUrl={props.notionUrl}
        />
      )}

      {props.progressLog.length > 0 && (
        <details className="text-xs text-[var(--muted)]">
          <summary className="cursor-pointer">Fortschritts-Log</summary>
          <ul className="mt-2 space-y-1">
            {props.progressLog.slice(-8).map((p, i) => (
              <li key={i}>
                {p.timestamp} · {p.phase}: {p.message}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
