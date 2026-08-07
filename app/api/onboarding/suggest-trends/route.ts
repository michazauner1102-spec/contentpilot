import { NextResponse } from "next/server";
import { draftTrendSuggestions } from "@/lib/trends/draftSuggestions";
import { parseWebResearchProvider } from "@/lib/research/webResearchProviders";
import type { WizardAnswerKey } from "@/lib/onboarding/wizardQuestions";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 90;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as {
      nische?: string;
      referentCreator?: string;
      questionId?: WizardAnswerKey;
      iterationFeedback?: string;
      rejectedLabels?: string[];
      iteration?: number;
      webProvider?: string;
    };

    if (!body.nische?.trim() || !body.questionId) {
      return NextResponse.json(
        { error: "nische und questionId erforderlich" },
        { status: 400 }
      );
    }

    const result = await draftTrendSuggestions({
      nische: body.nische.trim(),
      referentCreator: body.referentCreator,
      questionId: body.questionId,
      iterationFeedback: body.iterationFeedback,
      rejectedLabels: body.rejectedLabels,
      iteration: body.iteration ?? 1,
      webProvider: parseWebResearchProvider(body.webProvider),
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Trend-Vorschläge fehlgeschlagen" },
      { status: 500 }
    );
  }
}
