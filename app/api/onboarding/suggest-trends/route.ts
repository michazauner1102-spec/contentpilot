import { NextResponse } from "next/server";
import { draftTrendSuggestions } from "@/lib/trends/draftSuggestions";
import type { WizardAnswerKey } from "@/lib/onboarding/wizardQuestions";

export const maxDuration = 90;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      nische?: string;
      referentCreator?: string;
      questionId?: WizardAnswerKey;
      iterationFeedback?: string;
      rejectedLabels?: string[];
      iteration?: number;
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
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Trend-Vorschläge fehlgeschlagen" },
      { status: 500 }
    );
  }
}
