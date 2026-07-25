import { isLlmConfigured, callClaudeJSON } from "@/lib/llm";
import { liveAiEnabled } from "@/lib/demo/liveAi";
import {
  parseWebResearchProvider,
  runWebResearchWithProvider,
  type WebResearchProviderId,
} from "@/lib/research/webResearchProviders";
import type { WizardAnswerKey } from "@/lib/onboarding/wizardQuestions";

export interface TrendDraftSuggestion {
  id: string;
  label: string;
  value: string;
  rationale: string;
  trendHint?: string;
}

const QUESTION_QUERIES: Record<WizardAnswerKey, (nische: string) => string> = {
  zielgruppeDetail: (n) =>
    `${n} Social Media Zielgruppe Trends Deutschland 2025 2026`,
  contentZiel30Tage: (n) =>
    `${n} Content Marketing Ziele KPIs Short Video 30 Tage`,
  formatPraeferenz: (n) =>
    `${n} Reels TikTok YouTube Shorts Formate Trends 2025`,
  noGos: (n) =>
    `${n} Social Media Content Fehler No-Gos Authentizität`,
  zeitBudgetProWoche: (n) =>
    `${n} Content Batching Produktion Zeitplan Creator Workflow`,
};

function mockDrafts(
  questionId: WizardAnswerKey,
  nische: string,
  iteration: number
): TrendDraftSuggestion[] {
  const base = [
    {
      id: "m1",
      label: "KI-Agenturen & Automatisierung",
      value: `Gründer und Ops-Leads in KI-Agenturen (5–30 MA), die ${nische} skalieren wollen`,
      rationale: "B2B-Nische wächst; Entscheider suchen vertrauenswürdige Gesichter statt nur Ads.",
      trendHint: "Mock (Firecrawl-Key setzen für Live-Trends)",
    },
    {
      id: "m2",
      label: "Marketing-Verantwortliche ohne Video-Erfahrung",
      value: `Marketing-Manager in ${nische}, 28–45, erste Schritte mit Short-Video`,
      rationale: "Viele starten 2025/26 mit Personal Branding für Leadgen.",
      trendHint: `Iteration ${iteration}`,
    },
    {
      id: "m3",
      label: "Freelancer & Solopreneure",
      value: `Selbstständige in ${nische}, die inbound Leads über Reels/LinkedIn wollen`,
      rationale: "Tutorial + Talking Head performen stabil für Expertise.",
      trendHint: "Batch-Produktion im Trend",
    },
  ];

  if (questionId === "formatPraeferenz") {
    return [
      {
        id: "f1",
        label: "Talking Head + Untertitel",
        value: "Talking Head (deutsch), große Untertitel, Schnitt alle 3 Sekunden",
        rationale: "Standard für B2B-Reichweite ohne High-Production.",
      },
      {
        id: "f2",
        label: "Screen + Facecam",
        value: "Screen Recording mit Facecam für Demos/Workflows",
        rationale: "In KI/Agentur-Nischen stark für Vertrauen.",
      },
    ];
  }

  if (questionId !== "zielgruppeDetail") {
    return base.slice(0, 2).map((b, i) => ({
      ...b,
      id: `${questionId}-${i}`,
    }));
  }

  return base;
}

export async function draftTrendSuggestions(input: {
  nische: string;
  referentCreator?: string;
  questionId: WizardAnswerKey;
  iterationFeedback?: string;
  rejectedLabels?: string[];
  iteration?: number;
  webProvider?: WebResearchProviderId;
}): Promise<{
  suggestions: TrendDraftSuggestion[];
  researchSnippet: string;
  source: string;
}> {
  const query = QUESTION_QUERIES[input.questionId](input.nische);
  const provider = parseWebResearchProvider(input.webProvider);
  const web = await runWebResearchWithProvider(input.nische, provider, {
    queries: [query],
  });

  const snippets = web.snippets;
  const researchSnippet = snippets.slice(0, 5).join("\n\n---\n\n");

  if (!isLlmConfigured()) {
    return {
      suggestions: mockDrafts(
        input.questionId,
        input.nische,
        input.iteration ?? 1
      ),
      researchSnippet,
      source: web.source === "fallback" ? "fallback-mock" : `${web.source}+mock`,
    };
  }

  try {
    const result = await callClaudeJSON<{ suggestions: TrendDraftSuggestion[] }>(
      `Du erstellst 3–5 konkrete Antwort-Vorschläge für eine Wizard-Frage im Content-Tool ContentPilot.
Nutzer sind Anfänger — Sprache einfach, deutsch.
Jeder Vorschlag: kurzes label, value (Antworttext zum Übernehmen), rationale (1 Satz), optional trendHint.`,
      `Nische: ${input.nische}
Referent Creator: ${input.referentCreator ?? "—"}
Frage-ID: ${input.questionId}
Iteration: ${input.iteration ?? 1}
Abgelehnte Vorschläge (nicht wiederholen): ${(input.rejectedLabels ?? []).join("; ") || "—"}
Nutzer-Feedback für neue Runde: ${input.iterationFeedback ?? "—"}

Trend-Recherche (${web.source}):
${researchSnippet}`,
      `{ "suggestions": [{ "id": "unique", "label": "", "value": "", "rationale": "", "trendHint": "" }] }`
    );

    result.suggestions = result.suggestions.map((s, i) => ({
      ...s,
      id: s.id || `draft-${input.iteration}-${i}`,
    }));

    return {
      suggestions: result.suggestions.slice(0, 5),
      researchSnippet,
      source: `${web.source}+claude`,
    };
  } catch (err) {
    if (liveAiEnabled()) throw err;
    return {
      suggestions: mockDrafts(
        input.questionId,
        input.nische,
        input.iteration ?? 1
      ),
      researchSnippet,
      source: "mock",
    };
  }
}
