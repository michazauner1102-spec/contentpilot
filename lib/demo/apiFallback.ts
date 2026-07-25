import { NextResponse } from "next/server";
import { liveAiEnabled, liveAiErrorMessage } from "@/lib/demo/liveAi";

/** Bei konfiguriertem LLM: Fehler durchreichen. Sonst Mock-Body mit mock:true. */
export function aiRouteFailure(
  err: unknown,
  fallback: string,
  mockBody: Record<string, unknown>
): NextResponse {
  if (liveAiEnabled()) {
    return NextResponse.json(
      { error: liveAiErrorMessage(err, fallback) },
      { status: 502 }
    );
  }
  return NextResponse.json({ ...mockBody, mock: true });
}
