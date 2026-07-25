import type { Bereich } from "@/lib/types";
import { forceMockOnly } from "@/lib/demo/mockOnly";
import { CompositeInsightsProvider } from "./compositeInsightsProvider";
import { MockInsightsProvider } from "./mockInsightsProvider";
import type {
  BereichGrouped,
  InsightsProvider,
  VideoMeta,
  VideoWithInsights,
} from "./types";

export class InsightsService {
  constructor(private provider: InsightsProvider) {}

  static withMockData(): InsightsService {
    return new InsightsService(new MockInsightsProvider());
  }

  /** mock (Default) oder live — plattformweise API-Keys aus .env */
  static fromEnv(): InsightsService {
    const mode = (process.env.INSIGHTS_MODE ?? "mock").toLowerCase();
    if (forceMockOnly() || mode === "mock") {
      return InsightsService.withMockData();
    }
    return new InsightsService(new CompositeInsightsProvider());
  }

  async importPerformance(videos: VideoMeta[]): Promise<VideoWithInsights[]> {
    if (videos.length === 0) return [];
    return this.provider.fetchInsights(videos);
  }

  groupByBereich(videos: VideoWithInsights[]): BereichGrouped {
    const grouped: BereichGrouped = {
      reichweite: [],
      vertrauen: [],
      conversion: [],
    };
    for (const v of videos) {
      grouped[v.bereich].push(v);
    }
    return grouped;
  }
}

export { MockInsightsProvider } from "./mockInsightsProvider";
export type { VideoMeta, VideoWithInsights, InsightsMetrics, BereichGrouped } from "./types";
