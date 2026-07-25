import { NextResponse } from "next/server";
import { researchWithBriefing } from "@/lib/researchWithBriefing";
import { buildThemenBlocks } from "@/lib/research/themenBlocks";
import { mockResearch } from "@/lib/demo/flowMock";
import type { ContentBriefing } from "@/lib/types";
import type { ResearchFocusId } from "@/lib/research/themenBlocks";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      briefing?: ContentBriefing;
      feedback?: string;
      cycle?: number;
      focus?: ResearchFocusId[];
      brainstormIdeas?: import("@/lib/brainstorm/contentPillars").BrainstormIdea[];
    };
    if (!body.briefing) {
      return NextResponse.json({ error: "briefing fehlt" }, { status: 400 });
    }
    const cycle = body.cycle ?? 1;
    try {
      const research = await researchWithBriefing(
        body.briefing,
        body.feedback,
        cycle,
        body.focus,
        body.brainstormIdeas
      );
      const themen = buildThemenBlocks(research, body.briefing.praezisierteNische || body.briefing.nische);
      return NextResponse.json({ research, cycle, themen });
    } catch {
      const research = mockResearch(cycle);
      const themen = buildThemenBlocks(research, body.briefing!.praezisierteNische || body.briefing!.nische);
      return NextResponse.json({
        research,
        cycle,
        themen,
        mock: true,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Research fehlgeschlagen" },
      { status: 500 }
    );
  }
}
