import { NextResponse } from "next/server";
import { generateProductionGuide } from "@/lib/productionGuide";
import { mockProductionGuide } from "@/lib/demo/flowMock";
import { aiRouteFailure } from "@/lib/demo/apiFallback";
import type { ContentBriefing, VideoIdea } from "@/lib/types";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 60;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as {
      briefing?: ContentBriefing;
      ideas?: VideoIdea[];
    };
    if (!body.briefing || !body.ideas?.length) {
      return NextResponse.json(
        { error: "briefing und ideas erforderlich" },
        { status: 400 }
      );
    }
    try {
      const guide = await generateProductionGuide(body.briefing, body.ideas);
      return NextResponse.json({ guide });
    } catch (err) {
      return aiRouteFailure(err, "Produktions-Guide fehlgeschlagen", {
        guide: mockProductionGuide(),
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Produktions-Guide fehlgeschlagen" },
      { status: 500 }
    );
  }
}
