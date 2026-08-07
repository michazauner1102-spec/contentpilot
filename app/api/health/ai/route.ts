import { NextResponse } from "next/server";
import { liveAiStatus } from "@/lib/demo/liveAi";
import { storeLabel } from "@/lib/db";

export async function GET() {
  return NextResponse.json({
    ...liveAiStatus(),
    storage: storeLabel(),
  });
}
