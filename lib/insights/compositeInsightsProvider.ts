import { platformHasInsightsApi } from "@/lib/platforms/config";
import { InstagramInsightsProvider } from "./instagramInsightsProvider";
import { MockInsightsProvider } from "./mockInsightsProvider";
import type { InsightsProvider, VideoMeta, VideoWithInsights } from "./types";
import { YoutubeInsightsProvider } from "./youtubeInsightsProvider";
import { TiktokInsightsProvider } from "./tiktokInsightsProvider";
import { LinkedinInsightsProvider } from "./linkedinInsightsProvider";

/** Live-API wo konfiguriert, sonst plattformspezifische Mock-Metriken. */
export class CompositeInsightsProvider implements InsightsProvider {
  private mock = new MockInsightsProvider();

  async fetchInsights(videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    const mode = (process.env.INSIGHTS_MODE ?? "mock").toLowerCase();
    if (mode === "mock") {
      return this.mock.fetchInsights(videos);
    }

    const out: VideoWithInsights[] = [];
    for (const video of videos) {
      const live = await this.fetchLiveSingle(video);
      out.push(live ?? (await this.mock.fetchInsights([video]))[0]!);
    }
    return out;
  }

  private async fetchLiveSingle(
    video: VideoMeta
  ): Promise<VideoWithInsights | null> {
    const { platform } = video;
    if (!platformHasInsightsApi(platform)) return null;

    try {
      let provider: InsightsProvider | null = null;
      switch (platform) {
        case "youtube":
          provider = new YoutubeInsightsProvider();
          break;
        case "instagram":
          provider = new InstagramInsightsProvider();
          break;
        case "tiktok":
          provider = new TiktokInsightsProvider();
          break;
        case "linkedin":
          provider = new LinkedinInsightsProvider();
          break;
      }
      if (!provider) return null;
      const [row] = await provider.fetchInsights([video]);
      return row ?? null;
    } catch {
      return null;
    }
  }
}
