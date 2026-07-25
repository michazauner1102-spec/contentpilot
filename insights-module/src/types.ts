export type Bereich = "reichweite" | "vertrauen" | "conversion";
export type Platform = "instagram" | "youtube" | "tiktok";
export type VideoFormat = "talking_head" | "tutorial" | "story" | "b_roll";

export interface VideoMeta {
  id: string;
  title: string;
  bereich: Bereich;
  platform: Platform;
  postingDay: number;
  format?: VideoFormat;
}

export interface InsightsMetrics {
  views: number;
  watchTimeSeconds: number;
  completionRate: number;
  shares: number;
  saves: number;
  follows: number;
  profileVisits: number;
  comments: number;
  linkClicks: number;
  ctaRate: number;
  dms: number;
  bookings: number;
}

export interface VideoWithInsights extends VideoMeta {
  metrics: InsightsMetrics;
}

export interface InsightsProvider {
  fetchInsights(videos: VideoMeta[]): Promise<VideoWithInsights[]>;
}

export type BereichGrouped = Record<Bereich, VideoWithInsights[]>;
