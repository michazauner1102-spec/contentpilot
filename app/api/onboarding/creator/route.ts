import { NextResponse } from "next/server";
import { suggestCreatorReference } from "@/lib/onboarding/briefing";
import { mockCreatorSuggestion } from "@/lib/demo/flowMock";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { referentCreator, nische } = (await req.json()) as {
      referentCreator?: string;
      nische?: string;
    };
    if (!referentCreator?.trim() || !nische?.trim()) {
      return NextResponse.json(
        { error: "referentCreator und nische erforderlich" },
        { status: 400 }
      );
    }
    try {
      const suggestion = await suggestCreatorReference(
        referentCreator.trim(),
        nische.trim()
      );
      return NextResponse.json({ suggestion });
    } catch {
      return NextResponse.json({
        suggestion: mockCreatorSuggestion(referentCreator.trim()),
        mock: true,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Creator-Vorschläge fehlgeschlagen" },
      { status: 500 }
    );
  }
}
