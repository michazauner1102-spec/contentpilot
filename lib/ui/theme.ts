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
  "rounded-lg border border-[var(--accent)]/60 bg-[var(--accent)]/15 px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]/25 disabled:opacity-50";

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
