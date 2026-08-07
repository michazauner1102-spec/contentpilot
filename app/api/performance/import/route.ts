import { NextResponse } from "next/server";
import { InsightsService } from "@/lib/insights";
import type { VideoMeta } from "@/lib/insights/types";
import { requireUser } from "@/lib/auth/dal";

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as { videos?: VideoMeta[] };
    if (!body.videos?.length) {
      return NextResponse.json({ error: "videos fehlt" }, { status: 400 });
    }
    const service = InsightsService.fromEnv();
    const performance = await service.importPerformance(body.videos);
    const grouped = service.groupByBereich(performance);
    return NextResponse.json({ performance, grouped });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Import fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
