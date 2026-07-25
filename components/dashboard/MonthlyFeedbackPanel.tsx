"use client";

import { useState } from "react";
import { downloadTextFile } from "@/lib/export/downloadClient";
import {
  buildMonthlyFeedbackMarkdown,
  monthlyFeedbackFilename,
} from "@/lib/feedback/monthlyFeedbackMarkdown";
import type { VideoWithInsights } from "@/lib/insights/types";
import type {
  LoopAnalysisResult,
  MonthlyFeedbackDocument,
  ResearchResult,
} from "@/lib/types";
import { BTN_ACCENT, BTN_PRIMARY, BTN_SECONDARY, INPUT_FIELD } from "@/lib/ui/theme";

interface MonthlyFeedbackPanelProps {
  nische: string;
  monat: string;
  performance: VideoWithInsights[];
  learnings?: LoopAnalysisResult | null;
  research?: ResearchResult | null;
  compact?: boolean;
}

export function MonthlyFeedbackPanel({
  nische,
  monat,
  performance,
  learnings,
  research,
  compact = false,
}: MonthlyFeedbackPanelProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<MonthlyFeedbackDocument | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [selectKey, setSelectKey] = useState(0);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/loop/feedback-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nische,
          monat,
          performance,
          learnings,
          research,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehler");
      setDoc(data.document as MonthlyFeedbackDocument);
      setMarkdown(data.markdown as string);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erstellung fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const download = () => {
    const md = markdown ?? (doc ? buildMonthlyFeedbackMarkdown(doc) : "");
    if (!md) return;
    downloadTextFile(md, monthlyFeedbackFilename(nische, monat), "text/markdown");
  };

  const copy = async () => {
    const md = markdown ?? (doc ? buildMonthlyFeedbackMarkdown(doc) : "");
    if (!md) return;
    await navigator.clipboard.writeText(md);
  };

  const handleFeedbackAction = (value: string) => {
    switch (value) {
      case "generate":
        void generate();
        break;
      case "markdown":
        download();
        break;
      case "copy":
        void copy();
        break;
      default:
        break;
    }
    setSelectKey((k) => k + 1);
  };

  const hasPerformance = performance.length > 0;

  const previewCompact = doc && (
    <div className="grid md:grid-cols-3 gap-2 text-[11px] leading-snug pt-2">
      <p className="md:col-span-1 text-[var(--muted-strong)] line-clamp-4">
        {doc.executiveSummary}
      </p>
      <div className="space-y-1">
        <p className="text-[9px] uppercase text-[var(--muted)]">Gut</p>
        <ul className="list-disc pl-3 space-y-0.5">
          {doc.wasGut.slice(0, 2).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <p className="text-[9px] uppercase text-[var(--muted)] pt-1">Schwach</p>
        <ul className="list-disc pl-3 space-y-0.5 text-[var(--muted)]">
          {doc.wasSchlecht.slice(0, 2).map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-1">
        <p className="text-[9px] uppercase text-[var(--muted)]">Trends & Kommentare</p>
        <ul className="list-disc pl-3 space-y-0.5">
          {doc.trends.slice(0, 2).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="text-[var(--muted)] pt-1">
          {doc.kommentarAnalyse.sinnvolleAnzahl}/{doc.kommentarAnalyse.gesamtKommentare}{" "}
          Kommentare sinnvoll
        </p>
        {doc.kommentarAnalyse.highlights[0] && (
          <p className="italic text-[var(--muted-strong)] line-clamp-2">
            „{doc.kommentarAnalyse.highlights[0].text}"
          </p>
        )}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="border-t border-[var(--border)] pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={`feedback-action-${monat}`}
            className="text-[11px] font-medium text-[var(--foreground)] shrink-0"
          >
            Monats-Feedback · {monat}
          </label>
          <select
            key={selectKey}
            id={`feedback-action-${monat}`}
            disabled={loading}
            defaultValue=""
            onChange={(e) => handleFeedbackAction(e.target.value)}
            className={`${INPUT_FIELD} !w-auto min-w-[10rem] max-w-full !py-1.5 !px-2 text-xs`}
          >
            <option value="" disabled>
              {loading ? "Erstelle…" : "Aktion wählen…"}
            </option>
            <option value="generate" disabled={!hasPerformance}>
              Dokument erstellen
            </option>
            {doc && (
              <>
                <option value="markdown">Markdown laden</option>
                <option value="copy">In Zwischenablage</option>
              </>
            )}
          </select>
          {doc && (
            <span className="text-[10px] text-[var(--muted)]">
              {doc.kommentarAnalyse.sinnvolleAnzahl}/
              {doc.kommentarAnalyse.gesamtKommentare} Kommentare · bereit
            </span>
          )}
        </div>
        {error && <p className="text-xs text-red-400/90 mt-1">{error}</p>}
        {doc ? (
          <details className="mt-2 text-[11px] group">
            <summary className="cursor-pointer text-[var(--muted-strong)] hover:text-[var(--foreground)] list-none flex items-center gap-1">
              <span className="group-open:rotate-90 transition inline-block">▸</span>
              Vorschau einblenden
            </summary>
            {previewCompact}
          </details>
        ) : (
          !error && (
            <p className="text-[10px] text-[var(--muted)] mt-1">
              Erstellen → Trends, Gut/Schwach, Kommentar-Analyse exportieren.
            </p>
          )
        )}
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-6 space-y-4">
      <div>
        <h2 className="text-base font-semibold text-[var(--foreground)]">
          Monats-Feedback
        </h2>
        <p className="text-sm text-[var(--muted-strong)] mt-1 leading-relaxed">
          Nach dem Monat: Trends, was gut und schlecht lief, konkrete Vorschläge
          — plus Auswertung deiner Kommentare (Fragen, Leads, Spam).
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-400/90">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || !hasPerformance}
          onClick={() => void generate()}
          className={BTN_PRIMARY}
        >
          {loading ? "Erstelle Dokument…" : "Feedback-Dokument erstellen"}
        </button>
        {doc && (
          <>
            <button type="button" onClick={download} className={BTN_ACCENT}>
              Als Markdown laden
            </button>
            <button type="button" onClick={() => void copy()} className={BTN_SECONDARY}>
              Kopieren
            </button>
          </>
        )}
      </div>

      {!hasPerformance && (
        <p className="text-xs text-[var(--muted)]">
          Zuerst Metriken laden (Dashboard importiert Testdaten automatisch).
        </p>
      )}

      {doc && (
        <div className="space-y-5 pt-2 border-t border-[var(--border)] text-sm">
          {doc.mock && (
            <p className="text-xs text-[var(--muted)]">Demo-Modus (LLM optional)</p>
          )}
          <article className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-[var(--muted-strong)]">
              Kurzfassung
            </h3>
            <p className="leading-relaxed">{doc.executiveSummary}</p>
          </article>

          <div className="grid sm:grid-cols-2 gap-4">
            <article className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-[var(--muted-strong)]">
                Gut
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-[var(--foreground)]">
                {doc.wasGut.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
            <article className="space-y-2">
              <h3 className="text-xs uppercase tracking-wider text-[var(--muted-strong)]">
                Schwach
              </h3>
              <ul className="list-disc pl-4 space-y-1">
                {doc.wasSchlecht.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </article>
          </div>

          <article className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-[var(--muted-strong)]">
              Trends
            </h3>
            <ul className="list-disc pl-4 space-y-1">
              {doc.trends.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>

          <article className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider text-[var(--muted-strong)]">
              Konkrete Vorschläge
            </h3>
            {doc.konkreteVorschlaege.map((v) => (
              <div
                key={v.titel}
                className="rounded-lg border border-[var(--border)] px-3 py-2.5 space-y-1"
              >
                <p className="font-medium">
                  {v.titel}{" "}
                  <span className="text-[var(--muted)] font-normal text-xs">
                    · {v.prioritaet}
                  </span>
                </p>
                <p className="text-[var(--muted-strong)] leading-relaxed">
                  {v.beschreibung}
                </p>
              </div>
            ))}
          </article>

          <article className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-[var(--muted-strong)]">
              Kommentar-Analyse
            </h3>
            <p className="text-[var(--muted-strong)]">
              {doc.kommentarAnalyse.gesamtKommentare} Kommentare ·{" "}
              {doc.kommentarAnalyse.sinnvolleAnzahl} sinnvoll
            </p>
            {doc.kommentarAnalyse.themenAusKommentaren.length > 0 && (
              <ul className="list-disc pl-4 space-y-1">
                {doc.kommentarAnalyse.themenAusKommentaren.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            )}
            <ul className="space-y-2 mt-3">
              {doc.kommentarAnalyse.highlights.slice(0, 6).map((c) => (
                <li
                  key={c.id}
                  className="rounded-lg bg-[var(--background)] border border-[var(--border)] px-3 py-2 text-xs"
                >
                  <p className="text-[var(--foreground)]">„{c.text}"</p>
                  <p className="text-[var(--muted)] mt-1">
                    Tag {c.postingDay} · {c.kategorie} ·{" "}
                    {c.sinnvoll ? "sinnvoll" : "optional ignorieren"}
                  </p>
                  <p className="mt-1">{c.zusammenfassung}</p>
                </li>
              ))}
            </ul>
          </article>
        </div>
      )}
    </section>
  );
}
