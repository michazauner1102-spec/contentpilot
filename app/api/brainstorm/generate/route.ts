import { NextResponse } from "next/server";
import { generateBrainstormIdeas } from "@/lib/brainstorm/generateIdeas";
import type { ContentBriefing } from "@/lib/types";
import { requireUser } from "@/lib/auth/dal";

export const maxDuration = 90;

export async function POST(req: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  try {
    const body = (await req.json()) as { briefing?: ContentBriefing };
    if (!body.briefing) {
      return NextResponse.json({ error: "briefing fehlt" }, { status: 400 });
    }
    const ideas = await generateBrainstormIdeas(body.briefing);
    return NextResponse.json({ ideas });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Brainstorm fehlgeschlagen" },
      { status: 500 }
    );
  }
}
