import { NextResponse } from "next/server";
import {
  appendProgressToNotion,
  isNotionConfigured,
  syncPlanToNotion,
} from "@/lib/notion/syncPlan";
import type {
  ContentBriefing,
  ProductionGuide,
  ProgressEntry,
  ResearchResult,
  Zyklus,
} from "@/lib/types";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      briefing?: ContentBriefing;
      research?: ResearchResult;
      zyklus?: Zyklus;
      productionGuide?: ProductionGuide;
      progressLog?: ProgressEntry[];
      pageId?: string;
      progressEntry?: ProgressEntry;
    };

    if (body.pageId && body.progressEntry) {
      if (!isNotionConfigured()) {
        return NextResponse.json({
          ok: true,
          mock: true,
          message: "Notion nicht konfiguriert — Fortschritt nur lokal.",
        });
      }
      await appendProgressToNotion(body.pageId, body.progressEntry);
      return NextResponse.json({ ok: true });
    }

    if (
      !body.briefing ||
      !body.research ||
      !body.zyklus ||
      !body.progressLog
    ) {
      return NextResponse.json({ error: "Sync-Payload unvollständig" }, { status: 400 });
    }

    if (!isNotionConfigured()) {
      return NextResponse.json({
        mock: true,
        pageId: "mock-notion-page",
        url: "https://notion.so (Demo — NOTION_TOKEN + NOTION_DATABASE_ID setzen)",
        message:
          "Notion nicht konfiguriert. Fortschritt wird in der App protokolliert.",
      });
    }

    const result = await syncPlanToNotion({
      briefing: body.briefing,
      research: body.research,
      zyklus: body.zyklus,
      productionGuide: body.productionGuide,
      progressLog: body.progressLog,
    });

    return NextResponse.json({
      pageId: result.pageId,
      url: result.url,
      syncedAt: new Date().toISOString(),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Notion-Sync fehlgeschlagen" },
      { status: 500 }
    );
  }
}
