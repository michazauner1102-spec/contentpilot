import type { Bereich } from "@/lib/types";

export function bereichMutedClass(bereich: Bereich): string {
  switch (bereich) {
    case "reichweite":
      return "border-t-[var(--reichweite)]";
    case "vertrauen":
      return "border-t-[var(--vertrauen)]";
    case "conversion":
      return "border-t-[var(--conversion)]";
  }
}

export function bereichDotClass(bereich: Bereich): string {
  switch (bereich) {
    case "reichweite":
      return "bg-[var(--reichweite)]";
    case "vertrauen":
      return "bg-[var(--vertrauen)]";
    case "conversion":
      return "bg-[var(--conversion)]";
  }
}

/** Hauptaktion eines Screens — alle anderen Buttons bleiben grau. */
export const BTN_ACCENT =
  "rounded-lg border border-[var(--accent)]/80 bg-[var(--accent)]/20 px-4 py-2.5 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--accent)]/30 disabled:opacity-50";

/** Formularfelder — hoher Kontrast, klarer Fokus. */
export const INPUT_FIELD =
  "w-full rounded-lg border border-[var(--border)] bg-[var(--field-bg)] px-3 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] text-base sm:text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/35";

export const BTN_PRIMARY =
  "rounded-lg bg-[var(--btn-primary-bg)] text-[var(--btn-primary-fg)] px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-45";

export const BTN_SECONDARY =
  "rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)]/60";

export type AppMenuId = "calendar" | "todos" | "hitl" | "dashboard";

export const APP_MENU: { id: AppMenuId; label: string; description: string }[] =
  [
    {
      id: "calendar",
      label: "Kalender",
      description: "30-Tage-Plan & Tag-Details",
    },
    {
      id: "todos",
      label: "Aufnahme-To-dos",
      description: "Dreh-Wochen & Checkliste",
    },
    {
      id: "hitl",
      label: "Human in the Loop",
      description: "Plan & Research anpassen",
    },
    {
      id: "dashboard",
      label: "Dashboard",
      description: "Metriken & Loop",
    },
  ];
