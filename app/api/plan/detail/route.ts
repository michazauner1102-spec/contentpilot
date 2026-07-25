import { NextResponse } from "next/server";
import { generateVideoDetails } from "@/lib/shotListGenerator";
import { mockVideoDetails } from "@/lib/demo/flowMock";
import type { ReferenzVideo, ResearchResult, VideoIdea } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      videoIdea?: VideoIdea;
      research?: ResearchResult;
      referenzen?: ReferenzVideo[];
    };
    if (!body.videoIdea) {
      return NextResponse.json({ error: "videoIdea fehlt" }, { status: 400 });
    }
    try {
      const details = await generateVideoDetails(
        body.videoIdea,
        body.research,
        body.referenzen
      );
      return NextResponse.json(details);
    } catch {
      return NextResponse.json({
        ...mockVideoDetails(body.videoIdea, body.research),
        mock: true,
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Detail-Generierung fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
