import { NextResponse } from "next/server";
import { findReferenzVideos } from "@/lib/references";
import type { ResearchResult } from "@/lib/types";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 60;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as {
      nische?: string;
      research?: ResearchResult;
    };
    if (!body.nische?.trim() || !body.research) {
      return NextResponse.json(
        { error: "nische und research erforderlich" },
        { status: 400 }
      );
    }
    const referenzen = await findReferenzVideos(
      body.nische.trim(),
      body.research
    );
    return NextResponse.json({ referenzen });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Referenzen fehlgeschlagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
