import type {
  ContentBriefing,
  ProgressEntry,
  ProductionGuide,
  ResearchResult,
  Zyklus,
} from "@/lib/types";
import { forceMockOnly } from "@/lib/demo/mockOnly";

const NOTION_VERSION = "2022-06-28";

function getConfig() {
  if (forceMockOnly()) {
    return { token: undefined, databaseId: undefined };
  }
  const token = process.env.NOTION_TOKEN;
  const databaseId = process.env.NOTION_DATABASE_ID;
  return { token, databaseId };
}

async function notionFetch(
  path: string,
  token: string,
  body: unknown
): Promise<Response> {
  return fetch(`https://api.notion.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

export function isNotionConfigured(): boolean {
  const { token, databaseId } = getConfig();
  return Boolean(token && databaseId);
}

export async function syncPlanToNotion(input: {
  briefing: ContentBriefing;
  research: ResearchResult;
  zyklus: Zyklus;
  productionGuide?: ProductionGuide;
  progressLog: ProgressEntry[];
}): Promise<{ pageId: string; url: string }> {
  const { token, databaseId } = getConfig();
  if (!token || !databaseId) {
    throw new Error(
      "Notion nicht konfiguriert (NOTION_TOKEN + NOTION_DATABASE_ID)"
    );
  }

  const title = `ContentPilot — ${input.briefing.praezisierteNische || input.briefing.nische}`;

  const createRes = await notionFetch("/pages", token, {
    parent: { database_id: databaseId },
    properties: {
      Name: {
        title: [{ text: { content: title.slice(0, 100) } }],
      },
      Status: {
        select: { name: "In Planung" },
      },
      Nische: {
        rich_text: [{ text: { content: input.briefing.nische.slice(0, 200) } }],
      },
      Referent: {
        rich_text: [
          { text: { content: input.briefing.referentCreator.slice(0, 200) } },
        ],
      },
    },
    children: buildBlocks(input),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Notion API: ${createRes.status} ${err}`);
  }

  const page = (await createRes.json()) as { id: string; url?: string };
  return {
    pageId: page.id,
    url: page.url ?? `https://notion.so/${page.id.replace(/-/g, "")}`,
  };
}

function buildBlocks(input: {
  briefing: ContentBriefing;
  research: ResearchResult;
  zyklus: Zyklus;
  productionGuide?: ProductionGuide;
  progressLog: ProgressEntry[];
}) {
  const blocks: object[] = [
    heading("Content-Vision"),
    para(input.briefing.contentVision),
    heading("Research"),
    para(`Zielgruppe: ${input.research.zielgruppe}`),
    para(`Pain Points: ${input.research.painPoints.join(" · ")}`),
    heading("30-Tage-Plan (Auszug)"),
  ];

  for (const v of input.zyklus.plan.slice(0, 8)) {
    blocks.push(
      bulleted(`Tag ${v.postingDay} [${v.bereich}]: ${v.title} — ${v.hook}`)
    );
  }

  if (input.productionGuide) {
    blocks.push(heading("Produktion & Posting"));
    blocks.push(para(input.productionGuide.drehRhythmus));
    for (const t of input.productionGuide.postingZeiten) {
      blocks.push(bulleted(t));
    }
  }

  blocks.push(heading("Fortschritt"));
  for (const p of input.progressLog.slice(-15)) {
    blocks.push(bulleted(`${p.timestamp} · ${p.phase}: ${p.message}`));
  }

  return blocks;
}

function heading(text: string) {
  return {
    object: "block",
    type: "heading_2",
    heading_2: { rich_text: [{ type: "text", text: { content: text } }] },
  };
}

function para(text: string) {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1900) } }],
    },
  };
}

function bulleted(text: string) {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: [{ type: "text", text: { content: text.slice(0, 1900) } }],
    },
  };
}

export async function appendProgressToNotion(
  pageId: string,
  entry: ProgressEntry
): Promise<void> {
  const { token } = getConfig();
  if (!token) throw new Error("NOTION_TOKEN fehlt");

  const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      children: [
        bulleted(`${entry.timestamp} · ${entry.phase}: ${entry.message}`),
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Notion append: ${res.status} ${err}`);
  }
}
