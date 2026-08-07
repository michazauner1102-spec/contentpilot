import { NextResponse } from "next/server";
import { researchWithBriefing } from "@/lib/researchWithBriefing";
import { buildThemenBlocks } from "@/lib/research/themenBlocks";
import { parseWebResearchProvider } from "@/lib/research/webResearchProviders";
import { mockResearch } from "@/lib/demo/flowMock";
import { aiRouteFailure } from "@/lib/demo/apiFallback";
import type { ContentBriefing } from "@/lib/types";
import type { ResearchFocusId } from "@/lib/research/themenBlocks";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 120;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as {
      briefing?: ContentBriefing;
      feedback?: string;
      cycle?: number;
      focus?: ResearchFocusId[];
      brainstormIdeas?: import("@/lib/brainstorm/contentPillars").BrainstormIdea[];
      webProvider?: string;
      previousResearch?: import("@/lib/types").ResearchResult;
    };
    if (!body.briefing) {
      return NextResponse.json({ error: "briefing fehlt" }, { status: 400 });
    }
    const cycle = body.cycle ?? 1;
    const webProvider = parseWebResearchProvider(body.webProvider);
    try {
      const research = await researchWithBriefing(
        body.briefing,
        body.feedback,
        cycle,
        body.focus,
        body.brainstormIdeas,
        webProvider,
        body.previousResearch
      );
      const themen = buildThemenBlocks(research, body.briefing.praezisierteNische || body.briefing.nische);
      return NextResponse.json({ research, cycle, themen, webProvider });
    } catch (err) {
      const research = mockResearch(cycle);
      const themen = buildThemenBlocks(
        research,
        body.briefing!.praezisierteNische || body.briefing!.nische
      );
      return aiRouteFailure(err, "Research fehlgeschlagen", {
        research,
        cycle,
        themen,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Research fehlgeschlagen" },
      { status: 500 }
    );
  }
}
