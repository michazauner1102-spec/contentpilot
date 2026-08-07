import { NextResponse } from "next/server";
import { buildZyklusId, generatePlan } from "@/lib/planGenerator";
import { buildDemoZyklus } from "@/lib/demo/mockData";
import { aiRouteFailure } from "@/lib/demo/apiFallback";
import { ideasToPlan, type PlanGenerateInput } from "@/lib/types";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 240;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as PlanGenerateInput & {
      version?: number;
      monat?: string;
    };
    if (!body.nische || !body.research || !body.referenzen) {
      return NextResponse.json(
        { error: "nische, research, referenzen erforderlich" },
        { status: 400 }
      );
    }
    const version = body.version === 2 ? 2 : 1;
    const monat =
      body.monat?.trim() && /^\d{4}-\d{2}$/.test(body.monat.trim())
        ? body.monat.trim()
        : new Date().toISOString().slice(0, 7);
    try {
      const { ideas, bereichMix } = await generatePlan(body);
      const zyklus = {
        id: buildZyklusId(body.nische, version),
        nische: body.nische,
        monat,
        plan: ideasToPlan(ideas),
        bereichMix,
      };
      return NextResponse.json({ ideas, bereichMix, zyklus });
    } catch (err) {
      const demo = buildDemoZyklus(version);
      const zyklus = {
        ...demo,
        id: buildZyklusId(body.nische, version),
        nische: body.nische,
        monat,
      };
      return aiRouteFailure(err, "Plan-Generierung fehlgeschlagen", {
        ideas: zyklus.plan,
        bereichMix: zyklus.bereichMix,
        zyklus,
      });
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "Plan-Generierung fehlgeschlagen";
    const status = message.includes("API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
