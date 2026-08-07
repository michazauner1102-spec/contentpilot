import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/dal";
import { generateVideoDetails } from "@/lib/shotListGenerator";
import { liveAiEnabled, liveAiErrorMessage } from "@/lib/demo/liveAi";
import { mockVideoDetails } from "@/lib/demo/flowMock";
import type {
  ContentBriefing,
  ReferenzVideo,
  ResearchResult,
  VideoDetails,
  VideoIdea,
} from "@/lib/types";

export const maxDuration = 300;

/** Pro Request nur ein kleines Paket — der Client ruft mehrfach und zeigt Fortschritt. */
const MAX_PER_REQUEST = 6;
const CONCURRENCY = 3;

async function mapWithLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await fn(items[index]);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker)
  );
  return results;
}

export async function POST(req: Request) {
  const { response } = await requireUser();
  if (response) return response;

  try {
    const body = (await req.json()) as {
      videoIdeas?: VideoIdea[];
      research?: ResearchResult;
      referenzen?: ReferenzVideo[];
      briefing?: ContentBriefing;
    };

    const ideas = (body.videoIdeas ?? []).slice(0, MAX_PER_REQUEST);
    if (!ideas.length) {
      return NextResponse.json({ error: "videoIdeas fehlt" }, { status: 400 });
    }

    const failures: { id: string; error: string }[] = [];
    const details = await mapWithLimit(ideas, CONCURRENCY, async (idea) => {
      try {
        return await generateVideoDetails(
          idea,
          body.research,
          body.referenzen,
          body.briefing
        );
      } catch (err) {
        failures.push({
          id: idea.id,
          error: liveAiErrorMessage(err, "Skript fehlgeschlagen"),
        });
        // Ein einzelner Ausfall darf das Paket nicht kippen.
        return liveAiEnabled()
          ? ({ ...idea } as VideoDetails)
          : (mockVideoDetails(idea, body.research) as VideoDetails);
      }
    });

    return NextResponse.json({
      details,
      failures,
      mock: !liveAiEnabled(),
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : "Skript-Generierung fehlgeschlagen",
      },
      { status: 500 }
    );
  }
}
