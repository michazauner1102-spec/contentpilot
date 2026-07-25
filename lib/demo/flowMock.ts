import type {
  ContentBriefing,
  CreatorReferenceSuggestion,
  ProductionGuide,
  ResearchResult,
  VideoDetails,
  VideoIdea,
  WizardAnswers,
} from "@/lib/types";
import { BEREICH_LABELS } from "@/lib/types";
import { buildDemoZyklus, DEMO_RESEARCH } from "@/lib/demo/mockData";

export function mockCreatorSuggestion(
  referentCreator: string
): CreatorReferenceSuggestion {
  return {
    creatorName: referentCreator,
    warumRelevant: `${referentCreator} kombiniert klare Hooks mit wiedererkennbarem Format — gut als Stil-Anker.`,
    uebernehmbareElemente: [
      "Direkter Einstieg in den ersten 2 Sekunden",
      "Wechsel Talking Head ↔ B-Roll alle 3–4 Sekunden",
      "Serien-CTA („Teil 2 morgen“)",
    ],
    formate: ["talking_head", "tutorial", "story"],
    hookBeispiele: [
      "„Stop — bevor du …“",
      "„Die 3 Fehler bei …“",
      "POV: Kunde fragt …",
    ],
    referenzVideos: [],
  };
}

export function mockBriefing(
  nische: string,
  referentCreator: string,
  answers: WizardAnswers,
  creatorSuggestion?: CreatorReferenceSuggestion
): ContentBriefing {
  return {
    nische,
    referentCreator,
    answers,
    creatorSuggestion,
    praezisierteNische: `${nische} für ${answers.zielgruppeDetail}`,
    contentVision: `In 30 Tagen: ${answers.contentZiel30Tage}. Tonalität bodenständig, Formate: ${answers.formatPraeferenz}. No-Gos: ${answers.noGos}. Zeit: ${answers.zeitBudgetProWoche}. Inspiration: ${referentCreator}.`,
  };
}

export function mockResearch(cycle: number): ResearchResult & {
  researchNotizen: string;
} {
  return {
    ...DEMO_RESEARCH,
    researchNotizen: `Mock-Recherche Zyklus ${cycle} — API-Keys optional für Live-Daten.`,
  };
}

export function mockProductionGuide(): ProductionGuide {
  return {
    videoGestaltung: [
      "9:16, Untertitel immer an — 80 % schauen ohne Ton",
      "Gesicht in den ersten 2 Sekunden, dann B-Roll als Beweis",
      "Ein againbares Set (Werkstatt-Ecke) für Wiedererkennung",
    ],
    drehRhythmus:
      "1 Batch-Drehtag pro Woche (90 Min): 6–8 Kurzvideos nacheinander; Rest der Woche nur Schnitt + Posting.",
    postingZeiten: [
      "Instagram Reels: Di/Do 12:00 oder 18:30 (lokal testen)",
      "YouTube Shorts: Mi 17:00",
      "Conversion-Videos: Fr 10:00 mit klarer CTA",
    ],
    batchingTipp:
      "Hooks montags schreiben, dienstags drehen, mittwochs–freitags schedulen.",
    wochenplan: [
      {
        woche: 1,
        fokus: "Reichweite — Pattern Interrupt",
        drehTage: ["Di 17:00"],
        postTage: [1, 2, 4, 5, 7],
      },
      {
        woche: 2,
        fokus: "Vertrauen — BTS & Proof",
        drehTage: ["Di 17:00"],
        postTage: [8, 10, 12, 14],
      },
      {
        woche: 3,
        fokus: "Mix + erster Soft-CTA",
        drehTage: ["Mi 12:00"],
        postTage: [15, 17, 19, 21],
      },
      {
        woche: 4,
        fokus: "Conversion-Bündel",
        drehTage: ["Mo 10:00"],
        postTage: [25, 27, 28, 30],
      },
    ],
  };
}

export function mockZyklusFromBriefing(briefing: ContentBriefing) {
  const z = buildDemoZyklus(1);
  return { ...z, nische: briefing.praezisierteNische };
}

const MOCK_CTA: Record<string, string> = {
  reichweite: "Folgen, wenn du Teil 2 morgen sehen willst.",
  vertrauen: "Speichern — beim nächsten Mal brauchst du das.",
  conversion: "Schreib mir „START“ als DM — ich melde mich persönlich.",
};

export function mockVideoDetails(
  idea: VideoIdea,
  research?: ResearchResult
): VideoDetails {
  const painPoint = research?.painPoints?.[0] ?? "das häufigste Problem";
  return {
    ...idea,
    skript: {
      hook: idea.hook || `Pattern-Interrupt zu „${idea.title}“ in den ersten 2 Sekunden.`,
      body: `Ein konkretes Beispiel zu ${painPoint}: erst die Situation zeigen, dann deine Lösung in 2 Schritten, dann der Beweis (Ergebnis, Zahl oder Kundenreaktion). Kurze Sätze, ein Gedanke pro Schnitt.`,
      cta: MOCK_CTA[idea.bereich] ?? "Folgen für mehr.",
    },
    grafikVorschlag: `Text-Overlay „${idea.title}“ oben, Gesicht links, Beweisbild rechts — hoher Kontrast, 9:16.`,
    referenzVideoUrl: "",
    referenzBegruendung: `Format ${idea.format} passt zum Bereich ${BEREICH_LABELS[idea.bereich]} an Tag ${idea.postingDay}.`,
    drehAnleitung: [
      {
        setting: "Hauptset, Tageslicht seitlich",
        einstellungsgroesse: "Halbnah",
        inhalt: "Hook direkt in die Kamera, kein Intro",
        ungefaehreDauerSekunden: 3,
      },
      {
        setting: "Gleiches Set, halber Schritt zur Seite",
        einstellungsgroesse: "Nah",
        inhalt: "Problem benennen, Zuschauer abholen",
        ungefaehreDauerSekunden: 7,
      },
      {
        setting: "B-Roll am Objekt / Bildschirm",
        einstellungsgroesse: "Detail",
        inhalt: "Lösung zeigen statt erzählen",
        ungefaehreDauerSekunden: 12,
      },
      {
        setting: "Zurück zum Hauptset",
        einstellungsgroesse: "Halbnah",
        inhalt: "CTA ruhig und konkret aussprechen",
        ungefaehreDauerSekunden: 5,
      },
    ],
  };
}
