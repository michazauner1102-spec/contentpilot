"use client";

import { LoopAnalysisView } from "@/components/LoopAnalysisView";
import { PlanDiffSummaryView } from "@/components/PlanDiffSummary";
import { MonthlyFeedbackPanel } from "@/components/dashboard/MonthlyFeedbackPanel";
import type { VideoWithInsights } from "@/lib/insights/types";
import type { PlanDiffSummary } from "@/lib/planDiff";
import type { LoopAnalysisResult, ResearchResult } from "@/lib/types";
import { BTN_ACCENT } from "@/lib/ui/theme";

interface DashboardFeedbackSectionProps {
  learnings?: LoopAnalysisResult | null;
  learningsMock?: boolean;
  planDiff?: PlanDiffSummary | null;
  planVersion?: 1 | 2;
  onGeneratePlanV2?: () => void;
  planV2Loading?: boolean;
  hasLivePerformance?: boolean;
  nische: string;
  monat: string;
  performance: VideoWithInsights[];
  research?: ResearchResult | null;
}

export function DashboardFeedbackSection({
  learnings,
  learningsMock,
  planDiff,
  planVersion,
  onGeneratePlanV2,
  planV2Loading,
  hasLivePerformance,
  nische,
  monat,
  performance,
  research,
}: DashboardFeedbackSectionProps) {
  const showLearnings = Boolean(learnings?.length);

  return (
    <section
      className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
      aria-labelledby="dashboard-feedback-heading"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface-elevated)]/50">
        <div className="min-w-0">
          <h2
            id="dashboard-feedback-heading"
            className="text-sm font-semibold text-[var(--foreground)]"
          >
            Feedback & Loop
          </h2>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 leading-snug">
            Der Loop schließt sich — Learnings, Plan v2, Monats-Feedback
          </p>
        </div>
        {planVersion === 2 && (
          <span className="text-[10px] uppercase tracking-wide shrink-0 rounded border border-[var(--accent)]/50 bg-[var(--background)] px-2 py-1 text-[var(--muted-strong)]">
            Plan v2 · Kalender
          </span>
        )}
      </header>

      <div className="p-4 space-y-4">
        <div className="grid lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-4 space-y-3">
            {onGeneratePlanV2 && (
              <div className="rounded-lg border border-[var(--border)] bg-[var(--background)]/60 px-3 py-3 space-y-2">
                <p className="text-xs text-[var(--muted-strong)] leading-snug">
                  Metriken → Learnings → Plan v2 im Kalender.
                </p>
                <button
                  type="button"
                  disabled={planV2Loading || !hasLivePerformance}
                  onClick={onGeneratePlanV2}
                  className={`${BTN_ACCENT} w-full text-center text-xs py-2`}
                >
                  {planV2Loading
                    ? "Learnings & Plan v2…"
                    : "Plan v2 aus Learnings"}
                </button>
              </div>
            )}
            <PlanDiffSummaryView
              diff={planDiff ?? null}
              activeVersion={planVersion}
              compact
            />
          </div>

          <div className="lg:col-span-8">
            {showLearnings ? (
              <LoopAnalysisView
                learnings={learnings ?? null}
                mock={learningsMock}
                compact
              />
            ) : (
              <p className="text-xs text-[var(--muted)] rounded-lg border border-dashed border-[var(--border)] px-3 py-6 text-center">
                Nach dem Monat: „Plan v2 aus Learnings“ — dann erscheinen die
                Loop-Karten je Bereich.
              </p>
            )}
          </div>
        </div>

        <MonthlyFeedbackPanel
          compact
          nische={nische}
          monat={monat}
          performance={performance}
          learnings={learnings}
          research={research}
        />
      </div>
    </section>
  );
}
