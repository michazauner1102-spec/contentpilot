import { NextResponse } from "next/server";
import { analyzeLoop } from "@/lib/loopAnalysis";
import { DEMO_LEARNINGS } from "@/lib/demo/mockData";
import type { BereichGrouped } from "@/lib/insights/types";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      performanceGroupedByBereich?: BereichGrouped;
      grouped?: BereichGrouped;
    };
    const grouped = body.performanceGroupedByBereich ?? body.grouped;
    if (!grouped) {
      return NextResponse.json(
        { error: "performanceGroupedByBereich fehlt" },
        { status: 400 }
      );
    }
    try {
      const learnings = await analyzeLoop(grouped);
      return NextResponse.json({ learnings });
    } catch {
      return NextResponse.json({ learnings: DEMO_LEARNINGS, mock: true });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Loop-Analyse fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
