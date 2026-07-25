import { NextResponse } from "next/server";
import { researchNische } from "@/lib/research";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { nische } = (await req.json()) as { nische?: string };
    if (!nische?.trim()) {
      return NextResponse.json({ error: "nische fehlt" }, { status: 400 });
    }
    const research = await researchNische(nische.trim());
    return NextResponse.json(research);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Research fehlgeschlagen";
    const status = message.includes("API_KEY") ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
