"use client";

import { BEREICH_LABELS, type Bereich } from "@/lib/types";

/** Ein Fortschrittsbalken — keine doppelte Navigation */
const STAGES = [
  { id: "start", label: "Start", phases: ["setup"] },
  { id: "fragen", label: "Fragen", phases: ["wizard"] },
  {
    id: "brainstorm",
    label: "Brainstorm",
    phases: ["briefing", "brainstorm"],
  },
  { id: "research", label: "Research", phases: ["research"] },
  {
    id: "plan",
    label: "Plan",
    phases: ["plan", "production", "done"],
  },
] as const;

function activeStageIndex(phase: string): number {
  const idx = STAGES.findIndex((s) =>
    (s.phases as readonly string[]).includes(phase)
  );
  return idx >= 0 ? idx : 0;
}

export function PipelineStrip({ phase }: { phase: string }) {
  const active = activeStageIndex(phase);

  return (
    <nav aria-label="Fortschritt" className="overflow-x-auto">
      <ol className="flex min-w-[320px] items-center gap-1 sm:gap-0">
        {STAGES.map((stage, i) => {
          const isActive = i === active;
          const isDone = i < active;
          return (
            <li key={stage.id} className="flex flex-1 items-center">
              <div
                className={`flex-1 rounded-md border px-1.5 sm:px-2 py-1.5 text-center text-[10px] sm:text-xs whitespace-nowrap ${
                  isActive
                    ? "border-[var(--accent)] bg-[var(--surface-elevated)] font-semibold"
                    : isDone
                      ? "border-[var(--vertrauen)]/50 text-[var(--vertrauen)]"
                      : "border-[var(--border)] text-[var(--muted)]"
                }`}
              >
                {stage.label}
              </div>
              {i < STAGES.length - 1 && (
                <span
                  className={`hidden sm:block h-px w-2 shrink-0 ${isDone ? "bg-[var(--vertrauen)]/50" : "bg-[var(--border)]"}`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function bereichBorder(b: Bereich): string {
  switch (b) {
    case "reichweite":
      return "border-t-2 border-t-[var(--reichweite)]";
    case "vertrauen":
      return "border-t-2 border-t-[var(--vertrauen)]";
    case "conversion":
      return "border-t-2 border-t-[var(--conversion)]";
  }
}

const BADGE_CLASS: Record<Bereich, string> = {
  reichweite: "bg-[var(--reichweite)]/20 text-[var(--reichweite)]",
  vertrauen: "bg-[var(--vertrauen)]/20 text-[var(--vertrauen)]",
  conversion: "bg-[var(--conversion)]/20 text-[var(--conversion)]",
};

export function BereichBadge({ bereich }: { bereich: Bereich }) {
  return (
    <span
      className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded ${BADGE_CLASS[bereich]}`}
    >
      {BEREICH_LABELS[bereich]}
    </span>
  );
}
