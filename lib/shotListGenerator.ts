import { callClaudeJSON } from "@/lib/claude";
import type { ShotListItem, VideoDetails, VideoIdea } from "@/lib/types";

export async function generateShotList(
  videoIdea: VideoIdea,
  skript: VideoDetails["skript"]
): Promise<ShotListItem[]> {
  const result = await callClaudeJSON<{ drehAnleitung: ShotListItem[] }>(
    `Du erstellst praktische Dreh-Anleitungen für Social-Media-Videos (4-8 Shots).`,
    `Video:
${JSON.stringify(videoIdea, null, 2)}

Skript:
${JSON.stringify(skript, null, 2)}

Leite eine Shot-List ab mit setting, einstellungsgroesse, inhalt, ungefaehreDauerSekunden.`,
    `{ "drehAnleitung": [{ "setting", "einstellungsgroesse", "inhalt", "ungefaehreDauerSekunden" }] }`
  );

  return result.drehAnleitung;
}

export async function generateVideoDetails(
  videoIdea: VideoIdea,
  research?: import("@/lib/types").ResearchResult,
  referenzen?: import("@/lib/types").ReferenzVideo[]
): Promise<VideoDetails> {
  const { generateScriptAndGrafik } = await import("@/lib/scriptGenerator");
  const scriptPart = await generateScriptAndGrafik(
    videoIdea,
    research,
    referenzen
  );
  const drehAnleitung = await generateShotList(videoIdea, scriptPart.skript);
  return {
    ...videoIdea,
    ...scriptPart,
    drehAnleitung,
  };
}
