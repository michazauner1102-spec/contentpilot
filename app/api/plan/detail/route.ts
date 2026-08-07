import { NextResponse } from "next/server";
import { generateVideoDetails } from "@/lib/shotListGenerator";
import { mockVideoDetails } from "@/lib/demo/flowMock";
import { aiRouteFailure } from "@/lib/demo/apiFallback";
import { requireUser } from "@/lib/auth/dal";
import type {
  ContentBriefing,
  ReferenzVideo,
  ResearchResult,
  VideoIdea,
} from "@/lib/types";

export const maxDuration = 240;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as {
      videoIdea?: VideoIdea;
      research?: ResearchResult;
      referenzen?: ReferenzVideo[];
      briefing?: ContentBriefing;
    };
    if (!body.videoIdea) {
      return NextResponse.json({ error: "videoIdea fehlt" }, { status: 400 });
    }
    try {
      const details = await generateVideoDetails(
        body.videoIdea,
        body.research,
        body.referenzen,
        body.briefing
      );
      return NextResponse.json(details);
    } catch (err) {
      return aiRouteFailure(err, "Detail-Generierung fehlgeschlagen", {
        ...mockVideoDetails(body.videoIdea, body.research),
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Detail-Generierung fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
