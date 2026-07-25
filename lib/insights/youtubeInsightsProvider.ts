import type { InsightsProvider, VideoMeta, VideoWithInsights } from "./types";

/** Stub für YouTube Analytics API — später implementieren. */
export class YoutubeInsightsProvider implements InsightsProvider {
  async fetchInsights(_videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    throw new Error("YoutubeInsightsProvider: noch nicht implementiert");
  }
}
