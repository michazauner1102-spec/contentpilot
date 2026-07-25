export type Bereich = "reichweite" | "vertrauen" | "conversion";
export type Platform = "instagram" | "youtube" | "tiktok" | "linkedin";
export type VideoFormat = "talking_head" | "tutorial" | "story" | "b_roll";

export interface VideoIdea {
  id: string;
  title: string;
  hook: string;
  bereich: Bereich;
  format: VideoFormat;
  platform: Platform;
  postingDay: number;
  begruendung: string;
}

export interface ShotListItem {
  setting: string;
  einstellungsgroesse: string;
  inhalt: string;
  ungefaehreDauerSekunden: number;
}

export interface VideoDetails extends VideoIdea {
  skript: {
    hook: string;
    body: string;
    cta: string;
  };
  grafikVorschlag: string;
  referenzVideoUrl: string;
  referenzBegruendung: string;
  drehAnleitung: ShotListItem[];
}

export interface LoopLearnings {
  bereich: Bereich;
  hatFunktioniert: string[];
  hatNichtFunktioniert: string[];
  naechsteHebel: string[];
}

export type LoopAnalysisResult = LoopLearnings[];

export type CommentKategorie =
  | "frage"
  | "feedback"
  | "lead"
  | "kritik"
  | "lob"
  | "spam";

export interface SocialComment {
  id: string;
  videoId: string;
  videoTitle: string;
  postingDay: number;
  platform: Platform;
  text: string;
  likes?: number;
}

export interface AnalyzedComment extends SocialComment {
  sinnvoll: boolean;
  kategorie: CommentKategorie;
  zusammenfassung: string;
  handlungsempfehlung?: string;
}

export interface MonthlyFeedbackVorschlag {
  titel: string;
  beschreibung: string;
  prioritaet: "hoch" | "mittel" | "niedrig";
}

export interface MonthlyFeedbackDocument {
  monat: string;
  nische: string;
  erstelltAm: string;
  executiveSummary: string;
  trends: string[];
  wasGut: string[];
  wasSchlecht: string[];
  konkreteVorschlaege: MonthlyFeedbackVorschlag[];
  kommentarAnalyse: {
    gesamtKommentare: number;
    sinnvolleAnzahl: number;
    highlights: AnalyzedComment[];
    themenAusKommentaren: string[];
    zuIgnorieren: string[];
  };
  learningsByBereich?: LoopAnalysisResult;
  mock?: boolean;
}

export interface ResearchResult {
  zielgruppe: string;
  painPoints: [string, string, string];
  hookMuster: string[];
  tonality?: string;
}

export interface ReferenzVideo {
  url: string;
  title: string;
  format: VideoFormat;
  viewCount?: number;
  videoId?: string;
  /** Quelle: YouTube, TikTok, Instagram (Meta), LinkedIn */
  platform?: Platform;
}

export interface PlanGenerateInput {
  nische: string;
  research: ResearchResult;
  referenzen: ReferenzVideo[];
  learnings?: LoopAnalysisResult;
  bereichMix?: Record<Bereich, number>;
  briefing?: ContentBriefing;
}

export interface WizardQuestion {
  id: string;
  label: string;
  placeholder: string;
  hint?: string;
  /** Dropdown-Vorlagen — optional „Eigene Angabe“ via Freitext */
  selectOptions?: { value: string; label: string; detail?: string }[];
  /** Mehrfach-Auswahl als Chips (z. B. Formate, No-Gos) */
  chipOptions?: string[];
  /** Freitext zusätzlich oder statt Select */
  allowCustom?: boolean;
}

export interface WizardAnswers {
  zielgruppeDetail: string;
  contentZiel30Tage: string;
  formatPraeferenz: string;
  noGos: string;
  zeitBudgetProWoche: string;
}

export interface CreatorReferenceSuggestion {
  creatorName: string;
  warumRelevant: string;
  uebernehmbareElemente: string[];
  formate: VideoFormat[];
  hookBeispiele: string[];
  referenzVideos: ReferenzVideo[];
}

export interface ContentBriefing {
  nische: string;
  referentCreator: string;
  answers: WizardAnswers;
  praezisierteNische: string;
  contentVision: string;
  creatorSuggestion?: CreatorReferenceSuggestion;
}

export interface ProductionGuide {
  videoGestaltung: string[];
  drehRhythmus: string;
  postingZeiten: string[];
  batchingTipp: string;
  wochenplan: { woche: number; fokus: string; drehTage: string[]; postTage: number[] }[];
}

export interface ProgressEntry {
  timestamp: string;
  phase: string;
  message: string;
}

export interface NotionSyncResult {
  pageId: string;
  url: string;
  syncedAt: string;
}

export interface PlanGenerateOutput {
  ideas: VideoIdea[];
  bereichMix: Record<Bereich, number>;
}

import type { VideoWithInsights } from "@/lib/insights/types";

export interface Zyklus {
  id: string;
  nische: string;
  monat: string;
  plan: VideoDetails[];
  bereichMix: Record<Bereich, number>;
  performance?: VideoWithInsights[];
  learnings?: LoopAnalysisResult;
}

export const DEFAULT_BEREICH_MIX: Record<Bereich, number> = {
  reichweite: 0.6,
  vertrauen: 0.25,
  conversion: 0.15,
};

export const BEREICH_LABELS: Record<Bereich, string> = {
  reichweite: "Reichweite",
  vertrauen: "Vertrauen",
  conversion: "Conversion",
};

export function videoIdeaToMeta(idea: VideoIdea): import("@/lib/insights/types").VideoMeta {
  return {
    id: idea.id,
    title: idea.title,
    bereich: idea.bereich,
    platform: idea.platform,
    postingDay: idea.postingDay,
    format: idea.format,
  };
}

export function ideasToPlan(ideas: VideoIdea[]): VideoDetails[] {
  return ideas.map((idea) => ({
    ...idea,
    skript: { hook: "", body: "", cta: "" },
    grafikVorschlag: "",
    referenzVideoUrl: "",
    referenzBegruendung: "",
    drehAnleitung: [],
  }));
}
