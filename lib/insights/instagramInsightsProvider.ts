import type { InsightsProvider, VideoMeta, VideoWithInsights } from "./types";
import { MockInsightsProvider } from "./mockInsightsProvider";

/** Instagram Graph / Meta — Mock mit Instagram-Bias bis Media-Insights angebunden sind. */
export class InstagramInsightsProvider implements InsightsProvider {
  private mock = new MockInsightsProvider();

  async fetchInsights(videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    return this.mock.fetchInsights(
      videos.map((v) => ({ ...v, platform: "instagram" }))
    );
  }
}
