import { generateVideoScript } from "@/lib/scriptGenerator";
import type {
  ContentBriefing,
  ReferenzVideo,
  ResearchResult,
  ShotListItem,
  VideoDetails,
  VideoIdea,
} from "@/lib/types";

/** Mindestqualität absichern — ein leeres Skript soll nicht als fertig gelten. */
function isUsable(details: VideoDetails): boolean {
  return (
    details.skript.hook.trim().length > 0 &&
    details.skript.body.trim().length >= 80 &&
    details.drehAnleitung.length > 0
  );
}

export async function generateVideoDetails(
  videoIdea: VideoIdea,
  research?: ResearchResult,
  referenzen?: ReferenzVideo[],
  briefing?: ContentBriefing
): Promise<VideoDetails> {
  let payload = await generateVideoScript(
    videoIdea,
    research,
    referenzen,
    briefing
  );
  let details: VideoDetails = { ...videoIdea, ...payload };

  // Ein zweiter Versuch, falls das Modell zu knapp geantwortet hat.
  if (!isUsable(details)) {
    payload = await generateVideoScript(
      videoIdea,
      research,
      referenzen,
      briefing
    );
    details = { ...videoIdea, ...payload };
  }

  return details;
}

export type { ShotListItem };
