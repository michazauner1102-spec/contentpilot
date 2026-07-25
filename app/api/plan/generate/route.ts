import { NextResponse } from "next/server";
import { buildZyklusId, generatePlan } from "@/lib/planGenerator";
import { buildDemoZyklus } from "@/lib/demo/mockData";
import { ideasToPlan, type PlanGenerateInput } from "@/lib/types";

export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PlanGenerateInput & {
      version?: number;
    };
    if (!body.nische || !body.research || !body.referenzen) {
      return NextResponse.json(
        { error: "nische, research, referenzen erforderlich" },
        { status: 400 }
      );
    }
    const version = body.version === 2 ? 2 : 1;
    try {
      const { ideas, bereichMix } = await generatePlan(body);
      const zyklus = {
        id: buildZyklusId(body.nische, version),
        nische: body.nische,
        monat: new Date().toISOString().slice(0, 7),
        plan: ideasToPlan(ideas),
        bereichMix,
      };
      return NextResponse.json({ ideas, bereichMix, zyklus });
    } catch {
      const demo = buildDemoZyklus(version);
      const zyklus = {
        ...demo,
        id: buildZyklusId(body.nische, version),
        nische: body.nische,
        monat: new Date().toISOString().slice(0, 7),
      };
      return NextResponse.json({
        ideas: zyklus.plan,
        bereichMix: zyklus.bereichMix,
        zyklus,
        mock: true,
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Plan-Generierung fehlgeschlagen";
    const status = message.includes("API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
