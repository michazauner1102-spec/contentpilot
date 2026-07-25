import { callClaudeJSON, isLlmConfigured } from "@/lib/claude";
import type {
  ContentBriefing,
  LoopAnalysisResult,
  MonthSuggestionEvaluation,
  MonthSuggestionIntegration,
  VideoDetails,
  ResearchResult,
} from "@/lib/types";

export interface EvaluateMonthSuggestionInput {
  vorschlag: string;
  briefing: ContentBriefing;
  research?: ResearchResult | null;
  plan?: VideoDetails[];
  learnings?: LoopAnalysisResult | null;
  targetDay?: number | null;
  planVersion?: number;
  nische?: string;
}

const SCHEMA = `{
  "sinnvoll": true,
  "begruendung": "2-4 Sätze auf Deutsch",
  "score": 8,
  "verbesserung": "optional wenn nicht sinnvoll",
  "integration": {
    "postingDay": 1,
    "title": "",
    "hook": "",
    "bereich": "reichweite",
    "format": "talking_head",
    "platform": "instagram",
    "begruendung": "",
    "ersetztTitel": ""
  }
}`;

function pickReplacementDay(
  plan: VideoDetails[],
  targetDay?: number | null
): VideoDetails | undefined {
  if (!plan.length) return undefined;
  if (targetDay && targetDay >= 1 && targetDay <= 30) {
    return plan.find((v) => v.postingDay === targetDay);
  }
  const conversion = plan.filter((v) => v.bereich === "conversion");
  const pool = conversion.length ? conversion : plan;
  return [...pool].sort((a, b) => a.title.length - b.title.length)[0];
}

function heuristicEvaluate(
  input: EvaluateMonthSuggestionInput
): MonthSuggestionEvaluation {
  const text = input.vorschlag.trim();
  const plan = input.plan ?? [];
  const nische =
    input.briefing.praezisierteNische ||
    input.briefing.nische ||
    input.nische ||
    "Content";

  if (text.length < 12) {
    return {
      sinnvoll: false,
      score: 2,
      begruendung:
        "Der Vorschlag ist zu kurz — beschreibe Thema, Ziel (Reichweite/Vertrauen/Conversion) und gewünschtes Format.",
      verbesserung:
        "z. B. „Tutorial Tag 12: Fehler bei X vermeiden — Hook mit Zahl, Ziel Reichweite“",
      mock: true,
    };
  }

  const lower = text.toLowerCase();
  if (
    lower.includes("kaufen follower") ||
    lower.includes("viral hack ohne") ||
    text.length > 800
  ) {
    return {
      sinnvoll: false,
      score: 3,
      begruendung:
        "Passt nicht zur nachhaltigen Content-Strategie oder ist zu unklar umsetzbar.",
      verbesserung:
        "Bezug zur Nische, Zielgruppe und einem messbaren Video-Ziel herstellen.",
      mock: true,
    };
  }

  let bereich: MonthSuggestionIntegration["bereich"] = "reichweite";
  if (/conversion|cta|lead|anfrage|verkauf|termin/i.test(text)) {
    bereich = "conversion";
  } else if (/vertrauen|story|hinter|ehrlich|bts|kunde/i.test(text)) {
    bereich = "vertrauen";
  }

  let format: MonthSuggestionIntegration["format"] = "talking_head";
  if (/tutorial|schritt|anleitung|how/i.test(text)) format = "tutorial";
  else if (/story|pov|alltag/i.test(text)) format = "story";
  else if (/b-roll|broll|montage/i.test(text)) format = "b_roll";

  const title =
    text.length <= 72
      ? text.replace(/\s+/g, " ").trim()
      : `${text.slice(0, 69).trim()}…`;
  const hook = title.includes("—")
    ? title.split("—")[0].trim()
    : `Stop — ${title.slice(0, 55)}`;

  const replace = pickReplacementDay(plan, input.targetDay);
  const postingDay = replace?.postingDay ?? input.targetDay ?? 15;

  const integration: MonthSuggestionIntegration = {
    postingDay,
    title: title.startsWith("Tag") ? title : `Neu: ${title}`,
    hook,
    bereich,
    format,
    platform: replace?.platform ?? "instagram",
    begruendung: `Passt zu ${nische} und ergänzt Plan v${input.planVersion ?? 2} — ${bereich}-Fokus aus deinem Vorschlag.`,
    ersetztTitel: replace?.title,
  };

  return {
    sinnvoll: true,
    score: 7,
    begruendung: `Der Vorschlag ist konkret genug für ${bereich}-Content und lässt sich als Video-Idee in den 30-Tage-Plan integrieren${replace ? ` (Vorschlag: Tag ${postingDay} ersetzen)` : ""}.`,
    integration,
    mock: true,
  };
}

export async function evaluateMonthSuggestion(
  input: EvaluateMonthSuggestionInput
): Promise<MonthSuggestionEvaluation> {
  const vorschlag = input.vorschlag.trim();
  if (!vorschlag) {
    return {
      sinnvoll: false,
      score: 0,
      begruendung: "Bitte einen Vorschlag eingeben.",
    };
  }

  if (!isLlmConfigured()) {
    return heuristicEvaluate(input);
  }

  const planSummary = (input.plan ?? [])
    .slice(0, 30)
    .map(
      (v) =>
        `Tag ${v.postingDay}: [${v.bereich}] ${v.title} (${v.format}, ${v.platform})`
    )
    .join("\n");

  const targetHint =
    input.targetDay && input.targetDay >= 1 && input.targetDay <= 30
      ? `Nutzer wünscht Integration an Tag ${input.targetDay} (wenn sinnvoll).`
      : "Wähle einen passenden postingDay (1-30) zum Ersetzen eines schwachen oder thematisch passenden Slots.";

  try {
    const result = await callClaudeJSON<MonthSuggestionEvaluation>(
      `Du bist ContentPilot — bewertest Nutzer-Vorschläge für den nächsten Monats-Content (Plan v2) auf Deutsch.
Prüfe: Passung zu Nische/Briefing/Research, Mix (Reichweite/Vertrauen/Conversion), Umsetzbarkeit in 30-Tage-Plan.
sinnvoll=true nur wenn klar als ein Video-Idee umsetzbar und strategisch sinnvoll.
score 1-10. Wenn sinnvoll: integration mit vollständigem VideoIdea-Feldsatz (postingDay 1-30).
Wenn nicht sinnvoll: integration null, verbesserung mit konkretem Tipp.`,
      `Plan-Version: ${input.planVersion ?? 2}
${targetHint}

Briefing:
${JSON.stringify(input.briefing, null, 2)}

Research:
${input.research ? JSON.stringify(input.research) : "—"}

Loop-Learnings:
${input.learnings?.length ? JSON.stringify(input.learnings) : "—"}

Aktueller Plan (Auszug):
${planSummary || "Noch kein Plan — schlage postingDay und Felder vor, werden nach Freigabe übernommen."}

Nutzer-Vorschlag:
${vorschlag}`,
      SCHEMA
    );

    if (!result.sinnvoll) {
      return {
        ...result,
        integration: null,
        score: result.score ?? 4,
      };
    }

    if (!result.integration?.postingDay) {
      return heuristicEvaluate(input);
    }

    const day = Math.min(30, Math.max(1, result.integration.postingDay));
    return {
      ...result,
      score: result.score ?? 7,
      integration: { ...result.integration, postingDay: day },
    };
  } catch {
    return heuristicEvaluate(input);
  }
}

export function applyMonthSuggestionToPlan(
  plan: VideoDetails[],
  integration: MonthSuggestionIntegration
): VideoDetails | null {
  const existing = plan.find((v) => v.postingDay === integration.postingDay);
  if (!existing) return null;

  return {
    ...existing,
    title: integration.title,
    hook: integration.hook,
    bereich: integration.bereich,
    format: integration.format,
    platform: integration.platform,
    begruendung: integration.begruendung,
    skript: { hook: "", body: "", cta: "" },
    grafikVorschlag: "",
    referenzVideoUrl: "",
    referenzBegruendung: "",
    drehAnleitung: [],
  };
}
