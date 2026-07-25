import type { Bereich, Platform, VideoFormat } from "@/lib/types";
import type {
  InsightsMetrics,
  InsightsProvider,
  VideoMeta,
  VideoWithInsights,
} from "./types";

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function metricsForBereich(bereich: Bereich, seed: number): InsightsMetrics {
  const base = 1000 + (seed % 5000);
  const jitter = (n: number, spread: number) =>
    Math.max(0, Math.round(n + ((seed % 100) / 100 - 0.5) * spread));

  const common = {
    views: jitter(base, base * 0.4),
    watchTimeSeconds: jitter(base * 2.5, 500),
    completionRate: 0.35 + (seed % 40) / 100,
    shares: jitter(base * 0.02, 20),
    saves: jitter(base * 0.04, 30),
    follows: jitter(base * 0.01, 15),
    profileVisits: jitter(base * 0.03, 25),
    comments: jitter(base * 0.015, 12),
    linkClicks: jitter(base * 0.008, 10),
    ctaRate: 0.02 + (seed % 8) / 100,
    dms: jitter(5, 8),
    bookings: jitter(2, 4),
  };

  if (bereich === "reichweite") {
    common.completionRate = 0.25 + (seed % 55) / 100;
    common.shares = jitter(base * 0.05, 40);
  } else if (bereich === "vertrauen") {
    common.saves = jitter(base * 0.08, 50);
    common.follows = jitter(base * 0.025, 25);
  } else {
    common.linkClicks = jitter(base * 0.02, 30);
    common.ctaRate = 0.04 + (seed % 12) / 100;
    common.bookings = jitter(6, 10);
  }

  return common;
}

export class MockInsightsProvider implements InsightsProvider {
  async fetchInsights(videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    return videos.map((video) => {
      const seed = hashSeed(video.id);
      return {
        ...video,
        metrics: metricsForBereich(video.bereich, seed),
      };
    });
  }
}

export function demoVideoMetas(): VideoMeta[] {
  const samples: Omit<VideoMeta, "id">[] = [
    {
      title: "Demo Reichweite",
      bereich: "reichweite",
      platform: "instagram",
      postingDay: 1,
      format: "talking_head",
    },
    {
      title: "Demo Vertrauen",
      bereich: "vertrauen",
      platform: "youtube",
      postingDay: 5,
      format: "story",
    },
    {
      title: "Demo Conversion",
      bereich: "conversion",
      platform: "tiktok",
      postingDay: 10,
      format: "tutorial",
    },
  ];
  return samples.map((s, i) => ({ ...s, id: `demo-${i + 1}` }));
}
