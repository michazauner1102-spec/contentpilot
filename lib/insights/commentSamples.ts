import type { Platform } from "@/lib/types";
import type { SocialComment } from "@/lib/types";
import type { VideoWithInsights } from "./types";

const POOLS: Record<
  string,
  { text: string; platform?: Platform }[]
> = {
  reichweite: [
    { text: "Endlich mal jemand der es kurz erklärt — Teil 2?" },
    { text: "🔥🔥 folgt mir für free tips" },
    { text: "Funktioniert das auch für Maler?" },
    { text: "Hook war stark, Mitte etwas langsam" },
    { text: "❤️❤️" },
  ],
  vertrauen: [
    { text: "Danke für die Ehrlichkeit — genau so will ich arbeiten" },
    { text: "Wie lange brauchst du für so ein Projekt?" },
    { text: "Schick mir den Ablauf per DM bitte" },
    { text: "Fake — niemand macht das so" },
    { text: "Gespeichert für nächste Woche" },
  ],
  conversion: [
    { text: "ANFRAGE — brauche das für meinen Betrieb" },
    { text: "Was kostet sowas ungefähr?" },
    { text: "Link in Bio geht nicht bei mir" },
    { text: "Win win 🔥 check profile" },
    { text: "Kann man das auch remote besprechen?" },
  ],
};

function hash(n: number): number {
  return Math.abs((n * 9301 + 49297) % 233280);
}

/** Demo-Kommentare proportional zu Metriken — für Feedback-Dokument & Analyse. */
export function generateCommentSamplesForPerformance(
  videos: VideoWithInsights[]
): SocialComment[] {
  const out: SocialComment[] = [];
  let globalIdx = 0;

  for (const video of videos) {
    const pool = POOLS[video.bereich] ?? POOLS.reichweite;
    const count = Math.min(
      8,
      Math.max(2, Math.round(video.metrics.comments / 15))
    );

    for (let i = 0; i < count; i++) {
      const h = hash(globalIdx + video.postingDay * 17);
      const sample = pool[h % pool.length];
      globalIdx += 1;
      out.push({
        id: `${video.id}-c-${i}`,
        videoId: video.id,
        videoTitle: video.title,
        postingDay: video.postingDay,
        platform: sample.platform ?? video.platform,
        text: sample.text,
        likes: (h % 40) + 1,
      });
    }
  }

  return out;
}
