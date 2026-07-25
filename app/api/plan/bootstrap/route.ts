import { NextResponse } from "next/server";
import { buildZyklusId, generatePlan } from "@/lib/planGenerator";
import { researchNische } from "@/lib/research";
import { findReferenzVideos } from "@/lib/references";
import { ideasToPlan, type LoopAnalysisResult } from "@/lib/types";

export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      nische?: string;
      learnings?: LoopAnalysisResult;
      version?: number;
    };
    if (!body.nische?.trim()) {
      return NextResponse.json({ error: "nische fehlt" }, { status: 400 });
    }
    const nische = body.nische.trim();
    const research = await researchNische(nische);
    const referenzen = await findReferenzVideos(nische, research);
    const { ideas, bereichMix } = await generatePlan({
      nische,
      research,
      referenzen,
      learnings: body.learnings,
    });
    const version = body.version ?? 1;
    const zyklus = {
      id: buildZyklusId(nische, version),
      nische,
      monat: new Date().toISOString().slice(0, 7),
      plan: ideasToPlan(ideas),
      bereichMix,
      learnings: body.learnings,
    };
    return NextResponse.json({
      research,
      referenzen,
      ideas,
      bereichMix,
      zyklus,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Bootstrap fehlgeschlagen";
    const status = message.includes("API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
