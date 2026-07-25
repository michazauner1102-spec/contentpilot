"use client";

import { BEREICH_LABELS, type Bereich, type LoopAnalysisResult } from "@/lib/types";
import { bereichDotClass } from "@/lib/ui/theme";
import { bereichBorder } from "@/components/PipelineStrip";

interface LoopAnalysisViewProps {
  learnings: LoopAnalysisResult | null;
  mock?: boolean;
}

export function LoopAnalysisView({ learnings, mock }: LoopAnalysisViewProps) {
  if (!learnings?.length) return null;

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
