"use client";

import { useState } from "react";
import type { TrendDraftSuggestion } from "@/lib/trends/draftSuggestions";
import type { WizardAnswerKey } from "@/lib/onboarding/wizardQuestions";
import type { WebResearchProviderId } from "@/lib/research/webResearchProviders";

interface TrendSuggestionPanelProps {
  nische: string;
  referentCreator: string;
  questionId: WizardAnswerKey;
  webProvider?: WebResearchProviderId;
  onAccept: (value: string) => void;
}

export function TrendSuggestionPanel({
  nische,
  referentCreator,
  questionId,
  webProvider = "auto",
  onAccept,
}: TrendSuggestionPanelProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<TrendDraftSuggestion[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [acceptedLabel, setAcceptedLabel] = useState<string | null>(null);
  const [iteration, setIteration] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [source, setSource] = useState<string | null>(null);
  const [researchSnippet, setResearchSnippet] = useState("");

  const fetchDrafts = async (opts?: { feedback?: string; nextIteration?: number }) => {
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch("/api/onboarding/suggest-trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nische,
          referentCreator,
          questionId,
          iterationFeedback: opts?.feedback ?? feedback,
          rejectedLabels: rejected,
          iteration: opts?.nextIteration ?? iteration,
          webProvider,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setDrafts(data.suggestions ?? []);
      setResearchSnippet(data.researchSnippet ?? "");
      setSource(data.source ?? null);
      if (opts?.nextIteration) setIteration(opts.nextIteration);
    } finally {
      setLoading(false);
    }
  };

  const acceptDraft = (d: TrendDraftSuggestion) => {
    onAccept(d.value);
    setAcceptedLabel(d.label);
    setOpen(false);
  };

  const rejectDraft = (d: TrendDraftSuggestion) => {
    setRejected((r) => [...r, d.id, d.label]);
  };

  const visible = drafts.filter(
    (d) => !rejected.includes(d.id) && !rejected.includes(d.label)
  );

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left hover:bg-[var(--surface-elevated)]"
        onClick={() => {
          if (!drafts.length && !loading) fetchDrafts({ nextIteration: 1 });
          else setOpen(!open);
        }}
      >
        <div>
          <p className="text-sm font-semibold">Trend-Research (Web)</p>
          <p className="text-xs text-[var(--muted)]">
            {acceptedLabel
              ? `Übernommen: ${acceptedLabel}`
              : "Karten · Annehmen / Ablehnen / Iterieren"}
          </p>
        </div>
        <span className="text-xs rounded-full border border-[var(--border)] px-2 py-0.5 shrink-0">
          {loading ? "…" : open ? "▲" : "▼"}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[var(--border)]">
          <div className="flex flex-wrap gap-2 pt-3">
            <button
              type="button"
              disabled={loading}
              onClick={() => fetchDrafts({ nextIteration: iteration })}
              className="rounded-md border border-[var(--border)] bg-[var(--surface-elevated)] px-3 py-1.5 text-xs hover:bg-[var(--surface)]"
            >
              {loading ? "Lädt…" : "Trends aktualisieren"}
            </button>
            {source && (
              <span className="text-[10px] self-center text-[var(--muted)] uppercase">
                {source} · R{iteration}
              </span>
            )}
          </div>

          {visible.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {visible.map((d) => (
                <article
                  key={d.id}
                  className="rounded-lg border border-[var(--border)] p-3 flex flex-col gap-2 text-xs bg-[var(--background)]"
                >
                  <p className="font-semibold text-sm leading-tight">{d.label}</p>
                  <p className="text-[var(--muted)] flex-1 leading-relaxed">{d.value}</p>
                  <p className="text-[var(--muted)] italic opacity-90">{d.rationale}</p>
                  {d.trendHint && (
                    <span className="text-[10px] text-[var(--accent)]">{d.trendHint}</span>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-[var(--vertrauen)]/50 bg-[var(--vertrauen)]/15 py-2 text-[11px] font-medium hover:bg-[var(--vertrauen)]/25"
                      onClick={() => acceptDraft(d)}
                    >
                      Annehmen
                    </button>
                    <button
                      type="button"
                      className="flex-1 rounded-lg border border-[var(--border)] py-2 text-[11px] text-[var(--muted)] hover:bg-[var(--surface-elevated)]"
                      onClick={() => rejectDraft(d)}
                    >
                      Ablehnen
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            !loading && (
              <p className="text-xs text-[var(--muted)]">
                Keine Vorschläge — neu laden oder iterieren.
              </p>
            )
          )}

          {researchSnippet && (
            <details className="text-[11px] text-[var(--muted)]">
              <summary className="cursor-pointer">Recherche-Snippet</summary>
              <pre className="mt-1 whitespace-pre-wrap max-h-24 overflow-y-auto rounded border border-[var(--border)] p-2">
                {researchSnippet.slice(0, 800)}
              </pre>
            </details>
          )}

          <div className="flex gap-2 items-end">
            <textarea
              className="flex-1 rounded border border-[var(--border)] px-2 py-1 text-xs min-h-[48px] bg-[var(--background)]"
              placeholder="Iteration: z. B. mehr B2B …"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() =>
                fetchDrafts({ feedback, nextIteration: iteration + 1 })
              }
              className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs shrink-0"
            >
              Neu generieren
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
