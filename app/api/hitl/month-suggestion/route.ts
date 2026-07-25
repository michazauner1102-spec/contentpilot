import { NextResponse } from "next/server";
import { evaluateMonthSuggestion } from "@/lib/hitl/evaluateMonthSuggestion";
import type {
  ContentBriefing,
  LoopAnalysisResult,
  ResearchResult,
  VideoDetails,
} from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      vorschlag?: string;
      briefing?: ContentBriefing;
      research?: ResearchResult | null;
      plan?: VideoDetails[];
      learnings?: LoopAnalysisResult | null;
      targetDay?: number | null;
      planVersion?: number;
    };

    if (!body.vorschlag?.trim()) {
      return NextResponse.json({ error: "vorschlag fehlt" }, { status: 400 });
    }
    if (!body.briefing) {
      return NextResponse.json({ error: "briefing fehlt" }, { status: 400 });
    }

    const evaluation = await evaluateMonthSuggestion({
      vorschlag: body.vorschlag.trim(),
      briefing: body.briefing,
      research: body.research,
      plan: body.plan,
      learnings: body.learnings,
      targetDay: body.targetDay,
      planVersion: body.planVersion ?? 2,
    });

    return NextResponse.json({ evaluation });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bewertung fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
