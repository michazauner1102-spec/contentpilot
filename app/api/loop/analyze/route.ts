import { NextResponse } from "next/server";
import { analyzeLoop } from "@/lib/loopAnalysis";
import { DEMO_LEARNINGS } from "@/lib/demo/mockData";
import { aiRouteFailure } from "@/lib/demo/apiFallback";
import type { BereichGrouped } from "@/lib/insights/types";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 240;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

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
    } catch (err) {
      return aiRouteFailure(err, "Loop-Analyse fehlgeschlagen", {
        learnings: DEMO_LEARNINGS,
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Loop-Analyse fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
