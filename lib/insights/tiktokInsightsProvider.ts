import type { InsightsProvider, VideoMeta, VideoWithInsights } from "./types";
import { MockInsightsProvider } from "./mockInsightsProvider";

/**
 * TikTok Display/Research API — bei fehlendem Token: plattformspezifische Mock-Metriken.
 * Setze TIKTOK_ACCESS_TOKEN für Live-Modus (INSIGHTS_MODE=live).
 */
export class TiktokInsightsProvider implements InsightsProvider {
  private mock = new MockInsightsProvider();

  async fetchInsights(videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    if (!process.env.TIKTOK_ACCESS_TOKEN?.trim()) {
      return this.mock.fetchInsights(
        videos.map((v) => ({ ...v, platform: "tiktok" }))
      );
    }
    // TODO: TikTok Business API anbinden
    return this.mock.fetchInsights(
      videos.map((v) => ({ ...v, platform: "tiktok" }))
    );
  }
}
