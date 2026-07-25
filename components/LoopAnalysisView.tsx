"use client";

import { BEREICH_LABELS, type Bereich, type LoopAnalysisResult } from "@/lib/types";
import { bereichDotClass } from "@/lib/ui/theme";
import { bereichBorder } from "@/components/PipelineStrip";

interface LoopAnalysisViewProps {
  learnings: LoopAnalysisResult | null;
  mock?: boolean;
  compact?: boolean;
}

export function LoopAnalysisView({
  learnings,
  mock,
  compact = false,
}: LoopAnalysisViewProps) {
  if (!learnings?.length) return null;

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-strong)]">
            Loop-Analyse
          </h3>
          {mock && (
            <span className="text-[9px] uppercase tracking-wide rounded px-1 py-0.5 border border-[var(--border)] text-[var(--muted)]">
              Mock
            </span>
          )}
        </div>
        <div className="grid sm:grid-cols-3 gap-2">
          {learnings.map((l) => (
            <article
              key={l.bereich}
              className={`rounded-lg border border-[var(--border)] bg-[var(--background)]/50 p-2.5 space-y-2 ${bereichBorder(l.bereich)}`}
            >
              <h4 className="flex items-center gap-1.5 font-semibold text-[11px]">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${bereichDotClass(l.bereich as Bereich)}`}
                  aria-hidden
                />
                {BEREICH_LABELS[l.bereich as Bereich]}
              </h4>
              <div>
                <p className="text-[9px] uppercase text-[var(--muted)]">+</p>
                <ul className="list-disc pl-3 text-[10px] leading-snug space-y-0.5 mt-0.5">
                  {l.hatFunktioniert.slice(0, 2).map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[var(--muted)]">−</p>
                <ul className="list-disc pl-3 text-[10px] leading-snug space-y-0.5 mt-0.5 text-[var(--muted)]">
                  {l.hatNichtFunktioniert.slice(0, 2).map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] uppercase text-[var(--muted)]">Hebel</p>
                <ol className="list-decimal pl-3 text-[10px] font-medium leading-snug space-y-0.5 mt-0.5">
                  {l.naechsteHebel.slice(0, 2).map((x, i) => (
                    <li key={i}>{x}</li>
                  ))}
                </ol>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">Loop-Analyse</h2>
        {mock && (
          <span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border border-[var(--border)] text-[var(--muted)]">
            Mock-Daten
          </span>
        )}
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        {learnings.map((l) => (
          <article
            key={l.bereich}
            className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3 ${bereichBorder(l.bereich)}`}
          >
            <h3 className="flex items-center gap-2 font-semibold text-sm">
              <span
                className={`h-2 w-2 rounded-full ${bereichDotClass(l.bereich as Bereich)}`}
                aria-hidden
              />
              {BEREICH_LABELS[l.bereich as Bereich]}
            </h3>
            <div>
              <h4 className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Hat funktioniert
              </h4>
              <ul className="list-disc pl-4 text-xs space-y-1 mt-1">
                {l.hatFunktioniert.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Hat nicht funktioniert
              </h4>
              <ul className="list-disc pl-4 text-xs space-y-1 mt-1 text-[var(--muted)]">
                {l.hatNichtFunktioniert.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                Nächste Hebel
              </h4>
              <ol className="list-decimal pl-4 text-xs font-medium space-y-1 mt-1">
                {l.naechsteHebel.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ol>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
