"use client";

import { useState } from "react";
import { applyMonthSuggestionToPlan } from "@/lib/hitl/evaluateMonthSuggestion";
import type {
  ContentBriefing,
  LoopAnalysisResult,
  MonthSuggestionEvaluation,
  ResearchResult,
  VideoDetails,
  Zyklus,
} from "@/lib/types";
import { BTN_ACCENT, BTN_PRIMARY, BTN_SECONDARY } from "@/lib/ui/theme";
import { BereichBadge } from "@/components/PipelineStrip";

interface MonthSuggestionPanelProps {
  briefing: ContentBriefing;
  research: ResearchResult | null;
  zyklus: Zyklus | null;
  learnings?: LoopAnalysisResult | null;
  planVersion?: number;
  loading?: boolean;
  onApplyToPlan: (video: VideoDetails) => void;
  onLogged?: (message: string) => void;
}

export function MonthSuggestionPanel({
  briefing,
  research,
  zyklus,
  learnings,
  planVersion = 1,
  loading: parentLoading,
  onApplyToPlan,
  onLogged,
}: MonthSuggestionPanelProps) {
  const [text, setText] = useState("");
  const [targetDay, setTargetDay] = useState<number | "">("");
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MonthSuggestionEvaluation | null>(null);
  const [applied, setApplied] = useState(false);

  const plan = zyklus?.plan ?? [];
  const canApply = Boolean(zyklus && result?.sinnvoll && result.integration);

  const evaluate = async () => {
    if (!text.trim()) return;
    setEvaluating(true);
    setError(null);
    setApplied(false);
    try {
      const res = await fetch("/api/hitl/month-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vorschlag: text.trim(),
          briefing,
          research,
          plan: plan.length ? plan : undefined,
          learnings,
          targetDay: targetDay === "" ? null : targetDay,
          planVersion: planVersion >= 2 ? planVersion : 2,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Bewertung fehlgeschlagen");
      setResult(data.evaluation as MonthSuggestionEvaluation);
      onLogged?.(
        data.evaluation.sinnvoll
          ? `Vorschlag bewertet: sinnvoll (Score ${data.evaluation.score})`
          : "Vorschlag bewertet: noch nicht sinnvoll genug"
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehler bei der Bewertung");
    } finally {
      setEvaluating(false);
    }
  };

  const apply = () => {
    if (!result?.integration || !zyklus) return;
    const updated = applyMonthSuggestionToPlan(plan, result.integration);
    if (!updated) {
      setError(`Kein Video an Tag ${result.integration.postingDay} im Plan.`);
      return;
    }
    onApplyToPlan(updated);
    setApplied(true);
    onLogged?.(
      `Vorschlag eingebaut: Tag ${result.integration.postingDay} — „${result.integration.title}"`
    );
  };

  const busy = evaluating || parentLoading;

  return (
    <section className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <h2 className="font-semibold">Vorschläge für den nächsten Monat</h2>
        <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
          Beschreibe eine Idee für Plan v2 — die KI prüft Passung zu Nische, Mix und
          Learnings und kann sie in den Kalender übernehmen.
        </p>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Dein Vorschlag</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="z. B. Tutorial Tag 8: Die 3 häufigsten Fehler bei … — Fokus Reichweite, Hook mit Zahl"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm resize-y min-h-[96px]"
          disabled={busy}
        />
      </label>

      <div className="flex flex-wrap items-end gap-3">
        <label className="space-y-1">
          <span className="text-xs text-[var(--muted)]">Optional: Tag (1–30)</span>
          <input
            type="number"
            min={1}
            max={30}
            value={targetDay}
            onChange={(e) =>
              setTargetDay(e.target.value === "" ? "" : Number(e.target.value))
            }
            className="w-24 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2 py-1.5 text-sm"
            disabled={busy}
          />
        </label>
        <button
          type="button"
          onClick={() => evaluate()}
          disabled={busy || !text.trim()}
          className={BTN_PRIMARY}
        >
          {evaluating ? "KI bewertet …" : "Von KI bewerten"}
        </button>
      </div>

      {!zyklus && (
        <p className="text-xs text-[var(--muted)]">
          Nach Plan-Freigabe kannst du angenommene Vorschläge direkt in den Kalender
          einbauen. Die Bewertung funktioniert schon jetzt.
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div
          className={`rounded-lg border p-3 space-y-3 ${
            result.sinnvoll
              ? "border-emerald-500/40 bg-emerald-500/5"
              : "border-amber-500/40 bg-amber-500/5"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              {result.sinnvoll ? "Sinnvoll für Plan v2" : "Noch nicht sinnvoll"}
            </span>
            <span className="text-xs text-[var(--muted)]">Score {result.score}/10</span>
            {result.mock && (
              <span className="text-xs rounded-full border border-[var(--border)] px-2 py-0.5">
                Demo-Heuristik
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed">{result.begruendung}</p>
          {!result.sinnvoll && result.verbesserung && (
            <p className="text-sm">
              <span className="font-medium">Tipp: </span>
              {result.verbesserung}
            </p>
          )}
          {result.integration && (
            <div className="rounded-md border border-[var(--border)] bg-[var(--bg)] p-3 space-y-2 text-sm">
              <p className="font-medium">
                Integration · Tag {result.integration.postingDay}
                {result.integration.ersetztTitel && (
                  <span className="font-normal text-[var(--muted)]">
                    {" "}
                    (ersetzt „{result.integration.ersetztTitel.slice(0, 48)}
                    {result.integration.ersetztTitel.length > 48 ? "…" : ""}")
                  </span>
                )}
              </p>
              <p>{result.integration.title}</p>
              <p className="text-[var(--muted)]">Hook: {result.integration.hook}</p>
              <div className="flex flex-wrap gap-2 items-center">
                <BereichBadge bereich={result.integration.bereich} />
                <span className="text-xs uppercase tracking-wide opacity-70">
                  {result.integration.format.replace("_", " ")} ·{" "}
                  {result.integration.platform}
                </span>
              </div>
            </div>
          )}
          {canApply && (
            <button
              type="button"
              onClick={apply}
              disabled={applied || busy}
              className={applied ? BTN_SECONDARY : BTN_ACCENT}
            >
              {applied ? "Im Plan übernommen" : "In Plan einbauen"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
