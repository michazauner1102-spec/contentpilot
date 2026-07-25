import type {
  ContentBriefing,
  CreatorReferenceSuggestion,
  ProductionGuide,
  ResearchResult,
  VideoDetails,
  VideoIdea,
  WizardAnswers,
} from "@/lib/types";
import { buildDemoZyklus, DEMO_RESEARCH } from "@/lib/demo/mockData";
import { mergeDemoVideoDetails } from "@/lib/demo/videoScriptDemo";

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

export function mockVideoDetails(
  idea: VideoIdea,
  research?: ResearchResult
): VideoDetails {
  const shell: VideoDetails = {
    ...idea,
    skript: { hook: "", body: "", cta: "" },
    grafikVorschlag: "",
    referenzVideoUrl: "",
    referenzBegruendung: "",
    drehAnleitung: [],
  };
  return mergeDemoVideoDetails(shell, research);
}
