import type { InsightsProvider, VideoMeta, VideoWithInsights } from "./types";

/** Stub für Instagram Graph API Insights — später implementieren. */
export class InstagramInsightsProvider implements InsightsProvider {
  async fetchInsights(_videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    throw new Error("InstagramInsightsProvider: noch nicht implementiert");
  }
}
