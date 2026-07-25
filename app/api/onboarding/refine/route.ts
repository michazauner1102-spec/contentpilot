import { NextResponse } from "next/server";
import { refineBriefing } from "@/lib/onboarding/briefing";
import { mockBriefing } from "@/lib/demo/flowMock";
import type { CreatorReferenceSuggestion, WizardAnswers } from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      nische?: string;
      referentCreator?: string;
      answers?: WizardAnswers;
      creatorSuggestion?: CreatorReferenceSuggestion;
    };
    if (!body.nische || !body.referentCreator || !body.answers) {
      return NextResponse.json({ error: "Unvollständiges Briefing" }, { status: 400 });
    }
    try {
      const briefing = await refineBriefing({
        nische: body.nische,
        referentCreator: body.referentCreator,
        answers: body.answers,
        creatorSuggestion: body.creatorSuggestion,
      });
      return NextResponse.json({ briefing });
    } catch {
      const briefing = mockBriefing(
        body.nische,
        body.referentCreator,
        body.answers,
        body.creatorSuggestion
      );
      return NextResponse.json({ briefing, mock: true });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Briefing fehlgeschlagen" },
      { status: 500 }
    );
  }
}
