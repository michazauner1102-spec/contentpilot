export type ContentPillar = "attention" | "personal" | "value";

export type BrainstormStatus = "idee" | "entwurf" | "freigegeben";

export interface BrainstormIdea {
  id: string;
  pillar: ContentPillar;
  title: string;
  hook: string;
  superhook: string;
  format: string;
  status: BrainstormStatus;
}

export const PILLAR_META: Record<
  ContentPillar,
  {
    title: string;
    subtitle: string;
    ziel: string;
    formate: string[];
    bereichMap: "reichweite" | "vertrauen" | "conversion" | "vertrauen";
  }
> = {
  attention: {
    title: "Attention-Content",
    subtitle: "Trends · Hooks · Opinions",
    ziel: "Reichweite & Entdeckung durch neue Zielgruppen",
    formate: [
      "Reels mit starken Hooks, Trends oder provokativen Aussagen",
      "Reaktionen auf aktuelle Themen (z. B. „Was X falsch macht…“)",
      "Memes oder Edutainment (lustig + lehrreich)",
      "Vergleiche, Transformationen, Vorher-Nachher",
    ],
    bereichMap: "reichweite",
  },
  personal: {
    title: "Personal-Content",
    subtitle: "Vlog · Behind the Scenes",
    ziel: "Nähe & Identifikation schaffen",
    formate: [
      "Vlog-Elemente aus dem Alltag",
      "Team / Einblicke hinter die Kulissen",
      "Persönliche Meinungen & Learnings",
      "„Was wir gerade testen/machen…“",
    ],
    bereichMap: "vertrauen",
  },
  value: {
    title: "Value-Content",
    subtitle: "Wissen · Mehrwert · FAQ",
    ziel: "Vertrauen & Autorität aufbauen",
    formate: [
      "Erklärvideos (How-Tos, Tipps, Mythen aufklären)",
      "FAQs („Was Kunden oft fragen…“)",
      "Mini-Tutorials",
      "Karussells Step-by-Step",
    ],
    bereichMap: "vertrauen",
  },
};

export const SUPERHOOK_COPY = {
  title: "SuperHook",
  kurz:
    "Die SuperHook ist der zweite Satz im Video und beantwortet: „Warum sollte ich dir zuhören?“ Sie zeigt Glaubwürdigkeit oder Social Proof — kurz, glaubwürdig, nicht angeberisch. Ziel: in ~80 % der Videos.",
  beispielHook:
    "So bekommst du als Designer Kunden, ohne ständig Kaltakquise zu machen.",
  beispielSuperhook:
    "Ich lebe seit 2 Jahren komplett von meiner Selbstständigkeit – rein durch Content-Marketing.",
};

export const STATUS_LABELS: Record<BrainstormStatus, string> = {
  idee: "Idee",
  entwurf: "Entwurf",
  freigegeben: "Freigegeben",
};

export const STATUS_STYLES: Record<BrainstormStatus, string> = {
  idee: "bg-[var(--surface)] border-[var(--border)]",
  entwurf: "bg-[var(--conversion)]/10 border-[var(--conversion)]/40",
  freigegeben: "bg-[var(--vertrauen)]/10 border-[var(--vertrauen)]/40",
};

/** Notion „Shorts Factory“ — gedämpfte Säulen-Farben */
export const PILLAR_COLUMN_CLASS: Record<
  ContentPillar,
  { column: string; headerTitle: string; headerBorder: string }
> = {
  attention: {
    column: "border-[var(--pillar-attention)]/35 bg-[var(--pillar-attention-bg)]",
    headerTitle: "text-[var(--pillar-attention)]",
    headerBorder: "border-[var(--pillar-attention)]/40",
  },
  personal: {
    column: "border-[var(--pillar-personal)]/35 bg-[var(--pillar-personal-bg)]",
    headerTitle: "text-[var(--pillar-personal)]",
    headerBorder: "border-[var(--pillar-personal)]/40",
  },
  value: {
    column: "border-[var(--pillar-value)]/35 bg-[var(--pillar-value-bg)]",
    headerTitle: "text-[var(--pillar-value)]",
    headerBorder: "border-[var(--pillar-value)]/40",
  },
};
