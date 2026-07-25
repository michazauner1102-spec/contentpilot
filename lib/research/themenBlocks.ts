import type { Bereich, ResearchResult } from "@/lib/types";

export interface ResearchThemenBlock {
  bereich: Bereich;
  titel: string;
  beschreibung: string;
  themen: string[];
  contentIdeen: string[];
}

export function buildThemenBlocks(
  research: ResearchResult,
  nische: string
): ResearchThemenBlock[] {
  const hooks = research.hookMuster ?? [];
  return [
    {
      bereich: "reichweite",
      titel: "Reichweite & Aufmerksamkeit",
      beschreibung: `Scroll-stoppende Einstiege für „${nische}“`,
      themen: hooks.slice(0, 4),
      contentIdeen: [
        "Pattern-Interrupt in den ersten 2 Sekunden",
        "Mythen vs. Realität (Contrarian Take)",
        "Kurze Listen („3 Fehler …“)",
      ],
    },
    {
      bereich: "vertrauen",
      titel: "Vertrauen & Glaubwürdigkeit",
      beschreibung: research.zielgruppe,
      themen: [...research.painPoints],
      contentIdeen: [
        "Behind the Scenes / echter Prozess",
        "Case Study (anonym) mit Zahlen",
        "FAQ — ehrliche Antworten auf Einwände",
      ],
    },
    {
      bereich: "conversion",
      titel: "Conversion & Handlung",
      beschreibung: "Angebote und CTAs, die zur Zielgruppe passen",
      themen: [
        "Klares Lead-Magnet oder Erstgespräch",
        "Social Proof + nächster Schritt",
        research.tonality ?? "Direkte, hilfreiche Tonalität",
      ],
      contentIdeen: hooks.slice(-2).length
        ? hooks.slice(-2)
        : ["DM-Keyword", "Link-in-Bio Angebot"],
    },
  ];
}

export type ResearchFocusId =
  | "zielgruppe"
  | "trends"
  | "hooks"
  | "wettbewerb"
  | "formate";

export const RESEARCH_FOCUS_OPTIONS: {
  id: ResearchFocusId;
  label: string;
  detail: string;
}[] = [
  {
    id: "zielgruppe",
    label: "Zielgruppe schärfen",
    detail: "Demografie, Pain Points, Sprache",
  },
  {
    id: "trends",
    label: "Aktuelle Trends",
    detail: "Firecrawl / Web — was gerade performt",
  },
  {
    id: "hooks",
    label: "Hook-Bibliothek",
    detail: "Formulierungen zum Testen",
  },
  {
    id: "wettbewerb",
    label: "Wettbewerb & Referenzen",
    detail: "Was andere in der Nische machen",
  },
  {
    id: "formate",
    label: "Formate & Plattformen",
    detail: "Talking Head, Tutorial, Story …",
  },
];
