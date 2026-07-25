"use client";

import type { PlanDiffSummary } from "@/lib/planDiff";

interface PlanDiffSummaryViewProps {
  diff: PlanDiffSummary | null;
  activeVersion?: 1 | 2;
  compact?: boolean;
}

export function PlanDiffSummaryView({
  diff,
  activeVersion = 2,
  compact = false,
}: PlanDiffSummaryViewProps) {
  if (!diff) return null;

  if (compact) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--background)]/40 px-3 py-2.5 space-y-2 text-xs">
        <p className="font-medium text-[var(--foreground)] leading-snug">
          {diff.headline}
        </p>
        <p className="text-[var(--muted)] leading-snug">{diff.bereichMixChange}</p>
        <ul className="list-disc pl-4 space-y-0.5 text-[var(--muted-strong)]">
          {diff.bullets.slice(0, 4).map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <h2 className="text-lg font-semibold">{diff.headline}</h2>
        <span className="text-xs rounded-md border border-[var(--accent)]/50 bg-[var(--surface-elevated)] px-2 py-1">
          Aktiv im Kalender: Plan v{activeVersion}
        </span>
      </div>
      <p className="text-sm text-[var(--muted)]">{diff.bereichMixChange}</p>
      <ul className="list-disc pl-5 text-sm space-y-1">
        {diff.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
    </section>
  );
}
