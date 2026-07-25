import { NextResponse } from "next/server";
import { buildZyklusId, generatePlan } from "@/lib/planGenerator";
import { findReferenzVideos } from "@/lib/references";
import { ideasToPlan, type ContentBriefing, type ResearchResult } from "@/lib/types";
import { mockZyklusFromBriefing } from "@/lib/demo/flowMock";

export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      briefing?: ContentBriefing;
      research?: ResearchResult;
    };
    if (!body.briefing || !body.research) {
      return NextResponse.json(
        { error: "briefing und research erforderlich" },
        { status: 400 }
      );
    }

    const nische =
      body.briefing.praezisierteNische || body.briefing.nische;

    try {
      const referenzen = await findReferenzVideos(nische, body.research);
      const { ideas, bereichMix } = await generatePlan({
        nische,
        research: body.research,
        referenzen,
        briefing: body.briefing,
      });
      const zyklus = {
        id: buildZyklusId(nische, 1),
        nische,
        monat: new Date().toISOString().slice(0, 7),
        plan: ideasToPlan(ideas),
        bereichMix,
      };
      return NextResponse.json({ ideas, bereichMix, zyklus, referenzen });
    } catch {
      const zyklus = mockZyklusFromBriefing(body.briefing);
      return NextResponse.json({
        ideas: zyklus.plan,
        bereichMix: zyklus.bereichMix,
        zyklus,
        referenzen: [],
        mock: true,
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Plan fehlgeschlagen" },
      { status: 500 }
    );
  }
}
