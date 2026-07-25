import { callClaudeJSON } from "@/lib/claude";
import { findReferenzVideos } from "@/lib/references";
import type {
  ContentBriefing,
  CreatorReferenceSuggestion,
  WizardAnswers,
} from "@/lib/types";

export async function suggestCreatorReference(
  referentCreator: string,
  nische: string
): Promise<CreatorReferenceSuggestion> {
  const base = await callClaudeJSON<
    Omit<CreatorReferenceSuggestion, "referenzVideos">
  >(
    `Du analysierst Social-Media-Creator als Stil-Referenz für Video-Content.`,
    `Referent Creator: "${referentCreator}"
Nische des Nutzers: "${nische}"

Liefere übernehmbare, ethische Inspiration (Stil/Struktur, kein 1:1-Kopieren).`,
    `{
  "creatorName": "string",
  "warumRelevant": "string",
  "uebernehmbareElemente": ["string"],
  "formate": ["talking_head|tutorial|story|b_roll"],
  "hookBeispiele": ["string"]
}`
  );

  let referenzVideos: CreatorReferenceSuggestion["referenzVideos"] = [];
  try {
    referenzVideos = await findReferenzVideos(nische, {
      zielgruppe: nische,
      painPoints: ["", "", ""] as [string, string, string],
      hookMuster: base.hookBeispiele,
    });
  } catch {
    referenzVideos = [];
  }

  return { ...base, creatorName: referentCreator, referenzVideos };
}

export async function refineBriefing(input: {
  nische: string;
  referentCreator: string;
  answers: WizardAnswers;
  creatorSuggestion?: CreatorReferenceSuggestion;
}): Promise<ContentBriefing> {
  const refined = await callClaudeJSON<{
    praezisierteNische: string;
    contentVision: string;
  }>(
    `Du präzisierst Nische und Content-Vision für einen 30-Tage-Video-Plan.`,
    JSON.stringify(input, null, 2),
    `{ "praezisierteNische": "string", "contentVision": "string" }`
  );

  return {
    nische: input.nische,
    referentCreator: input.referentCreator,
    answers: input.answers,
    creatorSuggestion: input.creatorSuggestion,
    ...refined,
  };
}
