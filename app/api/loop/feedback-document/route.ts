import { NextResponse } from "next/server";
import { generateMonthlyFeedbackDocument } from "@/lib/feedback/monthlyFeedback";
import { buildMonthlyFeedbackMarkdown } from "@/lib/feedback/monthlyFeedbackMarkdown";
import type { VideoWithInsights } from "@/lib/insights/types";
import type { LoopAnalysisResult, ResearchResult } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      nische?: string;
      monat?: string;
      performance?: VideoWithInsights[];
      learnings?: LoopAnalysisResult | null;
      research?: ResearchResult | null;
    };

    if (!body.nische?.trim()) {
      return NextResponse.json({ error: "nische fehlt" }, { status: 400 });
    }
    if (!body.performance?.length) {
      return NextResponse.json(
        { error: "performance fehlt — zuerst Metriken importieren" },
        { status: 400 }
      );
    }

    const monat =
      body.monat?.trim() ||
      new Date().toISOString().slice(0, 7);

    const document = await generateMonthlyFeedbackDocument({
      nische: body.nische.trim(),
      monat,
      performance: body.performance,
      learnings: body.learnings,
      research: body.research,
    });

    const markdown = buildMonthlyFeedbackMarkdown(document);

    return NextResponse.json({ document, markdown });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Feedback-Dokument fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
