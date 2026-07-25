"use client";

type SetupFlowPhase =
  | "setup"
  | "wizard"
  | "briefing"
  | "brainstorm"
  | "research"
  | "plan"
  | "production"
  | "done";

const FLOW_STEPS: {
  phase: SetupFlowPhase | SetupFlowPhase[];
  label: string;
  hint: string;
}[] = [
  { phase: "setup", label: "Nische", hint: "Nische & Referent" },
  {
    phase: "wizard",
    label: "5 Fragen",
    hint: "Zielgruppe & Ziele schärfen",
  },
  { phase: "briefing", label: "Briefing", hint: "Creator & Vision" },
  { phase: "brainstorm", label: "Brainstorm", hint: "Ideen-Board" },
  { phase: "research", label: "Research", hint: "Human in the Loop" },
  { phase: "plan", label: "30-Tage-Plan", hint: "Mix & Freigabe" },
  {
    phase: ["production", "done"],
    label: "Kalender & Loop",
    hint: "Dreh, Metriken, Plan v2",
  },
];

function phaseIndex(phase: SetupFlowPhase): number {
  for (let i = 0; i < FLOW_STEPS.length; i++) {
    const p = FLOW_STEPS[i].phase;
    if (Array.isArray(p) ? p.includes(phase) : p === phase) return i;
  }
  if (phase === "production") return FLOW_STEPS.length - 1;
  return 0;
}

interface PlanSetupFlowchartProps {
  phase: SetupFlowPhase;
  wizardStep?: number;
  wizardTotal?: number;
  planReady?: boolean;
}

export function PlanSetupFlowchart({
  phase,
  wizardStep = 0,
  wizardTotal = 5,
  planReady,
}: PlanSetupFlowchartProps) {
  let active = phaseIndex(phase);
  if (planReady && (phase === "done" || phase === "production")) {
    active = FLOW_STEPS.length - 1;
  }

  return (
    <nav
      className="rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 sm:p-5"
      aria-label="Ablauf Plan-Setup"
    >
      <p className="text-xs uppercase tracking-wider text-[var(--muted-strong)] mb-4 font-medium">
        Dein Weg zum Content-Plan · Schritt {active + 1} von {FLOW_STEPS.length}
      </p>
      <ol className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {FLOW_STEPS.map((step, i) => {
          const done = i < active;
          const current = i === active;
          const label =
            step.label === "5 Fragen" && current && phase === "wizard"
              ? `Fragen ${wizardStep + 1}/${wizardTotal}`
              : step.label;

          return (
            <li key={step.label} className="relative">
              {i > 0 && (
                <span
                  className="absolute -left-1 top-1/2 hidden lg:block -translate-y-1/2 text-[var(--muted)] text-xs"
                  aria-hidden
                >
                  ›
                </span>
              )}
              <div
                className={`h-full rounded-lg border px-2.5 py-2.5 transition ${
                  current
                    ? "border-[var(--foreground)]/35 bg-[var(--accent)]/15 ring-2 ring-[var(--accent)]/40"
                    : done
                      ? "border-[var(--border)] bg-[var(--background)]/80"
                      : "border-dashed border-[var(--border)] bg-[var(--background)]/40"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
                      current
                        ? "bg-[var(--foreground)] text-[var(--background)]"
                        : done
                          ? "bg-[var(--vertrauen)] text-[var(--foreground)]"
                          : "bg-[var(--surface-elevated)] text-[var(--muted)] border border-[var(--border)]"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  <p
                    className={`text-xs font-semibold leading-tight ${
                      current
                        ? "text-[var(--foreground)]"
                        : done
                          ? "text-[var(--muted-strong)]"
                          : "text-[var(--muted)]"
                    }`}
                  >
                    {label}
                  </p>
                  <p
                    className={`text-[10px] leading-snug line-clamp-2 ${
                      current ? "text-[var(--muted-strong)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {step.hint}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
