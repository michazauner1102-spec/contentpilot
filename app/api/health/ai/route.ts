import { NextResponse } from "next/server";
import { liveAiStatus } from "@/lib/demo/liveAi";

export async function GET() {
  const status = liveAiStatus();
  return NextResponse.json(status);
}
