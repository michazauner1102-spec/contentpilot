import type { InsightsProvider, VideoMeta, VideoWithInsights } from "./types";
import { MockInsightsProvider } from "./mockInsightsProvider";

/**
 * LinkedIn Marketing API — bei fehlendem Token: Mock mit LinkedIn-Bias.
 * LINKEDIN_ACCESS_TOKEN + LINKEDIN_ORGANIZATION_URN für Live-Vorbereitung.
 */
export class LinkedinInsightsProvider implements InsightsProvider {
  private mock = new MockInsightsProvider();

  async fetchInsights(videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    return this.mock.fetchInsights(
      videos.map((v) => ({ ...v, platform: "linkedin" }))
    );
  }
}
