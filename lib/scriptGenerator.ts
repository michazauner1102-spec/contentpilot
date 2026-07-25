import { callClaudeJSON } from "@/lib/claude";
import type {
  ReferenzVideo,
  ResearchResult,
  VideoDetails,
  VideoIdea,
} from "@/lib/types";

const BEREICH_RULES: Record<string, string> = {
  reichweite:
    "Hook scroll-stoppend, offene Schleife am Ende, kein harter Sales-CTA.",
  vertrauen:
    "Substanz und Proof im Body, sanfter CTA (folgen/speichern/kommentieren).",
  conversion: "Klarer Nutzen, starker CTA, Handlung auslösen (Link/DM/Booking).",
};

export async function generateScriptAndGrafik(
  videoIdea: VideoIdea,
  research?: ResearchResult,
  referenzen?: ReferenzVideo[]
): Promise<
  Pick<
    VideoDetails,
    "skript" | "grafikVorschlag" | "referenzVideoUrl" | "referenzBegruendung"
  >
> {
  const refs = referenzen ?? [];
  const result = await callClaudeJSON<{
    skript: { hook: string; body: string; cta: string };
    grafikVorschlag: string;
    referenzVideoUrl: string;
    referenzBegruendung: string;
  }>(
    `Du schreibst Short-Video-Skripte auf Deutsch.
Bereichsregel (${videoIdea.bereich}): ${BEREICH_RULES[videoIdea.bereich]}`,
    `Video-Idea:
${JSON.stringify(videoIdea, null, 2)}

Research (optional):
${research ? JSON.stringify(research) : "—"}

Referenzvideos (wähle passendste URL):
${JSON.stringify(refs, null, 2)}

Erstelle Skript (hook/body/cta), Grafik-Vorschlag (Text-Overlay + Thumbnail-Idee), und wähle eine Referenz-URL aus der Liste (oder erste URL).`,
    `{
  "skript": { "hook": "", "body": "", "cta": "" },
  "grafikVorschlag": "",
  "referenzVideoUrl": "",
  "referenzBegruendung": ""
}`
  );

  return result;
}
