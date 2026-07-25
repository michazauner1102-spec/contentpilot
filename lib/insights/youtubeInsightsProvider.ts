import type { InsightsProvider, VideoMeta, VideoWithInsights } from "./types";
import { MockInsightsProvider } from "./mockInsightsProvider";

/** YouTube Analytics — Mock mit YouTube-Bias; OAuth für INSIGHTS_MODE=live vorbereitet. */
export class YoutubeInsightsProvider implements InsightsProvider {
  private mock = new MockInsightsProvider();

  async fetchInsights(videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    return this.mock.fetchInsights(
      videos.map((v) => ({ ...v, platform: "youtube" }))
    );
  }
}
