import { NextResponse } from "next/server";
import { buildZyklusId, generatePlan } from "@/lib/planGenerator";
import { findReferenzVideos } from "@/lib/references";
import { ideasToPlan, type ContentBriefing, type ResearchResult } from "@/lib/types";
import { mockZyklusFromBriefing } from "@/lib/demo/flowMock";
import { aiRouteFailure } from "@/lib/demo/apiFallback";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 240;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

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
    } catch (err) {
      const zyklus = mockZyklusFromBriefing(body.briefing);
      return aiRouteFailure(err, "Plan fehlgeschlagen", {
        ideas: zyklus.plan,
        bereichMix: zyklus.bereichMix,
        zyklus,
        referenzen: [],
      });
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Plan fehlgeschlagen" },
      { status: 500 }
    );
  }
}
