import { callLLMJSON } from "@/lib/claude";
import type { ReferenzVideo, ResearchResult, VideoFormat } from "@/lib/types";
import { findReferenzVideosMultiPlatform } from "@/lib/references/multiPlatform";

interface YtStats {
  id?: string;
  statistics?: { viewCount?: string };
}

async function fetchViewCounts(
  videoIds: string[]
): Promise<Record<string, number>> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key || videoIds.length === 0) return {};

  const url = new URL("https://www.googleapis.com/youtube/v3/videos");
  url.searchParams.set("part", "statistics");
  url.searchParams.set("id", videoIds.join(","));
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  if (!res.ok) return {};

  const data = (await res.json()) as { items?: YtStats[] };
  const map: Record<string, number> = {};
  for (const item of data.items ?? []) {
    if (item.id) {
      map[item.id] = parseInt(item.statistics?.viewCount ?? "0", 10);
    }
  }
  return map;
}

export async function findReferenzVideos(
  nische: string,
  research: ResearchResult
): Promise<ReferenzVideo[]> {
  const raw = await findReferenzVideosMultiPlatform(nische, research);
  if (raw.length === 0) {
    return findReferenzVideosMultiPlatform(nische, {
      ...research,
      painPoints:
        research.painPoints.length > 0
          ? research.painPoints
          : ["Content-Ideen", "Sichtbarkeit", "Zeitmangel"],
    });
  }

  const youtubeIds = raw
    .filter((r) => r.platform === "youtube" && r.url.includes("watch?v="))
    .map((r) => {
      if (r.videoId) return r.videoId;
      try {
        return new URL(r.url).searchParams.get("v") ?? "";
      } catch {
        return "";
      }
    })
    .filter(Boolean);

  const viewCounts = await fetchViewCounts(youtubeIds);

  const ytForClassify = raw
    .filter((r) => r.platform === "youtube" && r.url.includes("watch?v="))
    .map((r) => ({
      videoId: r.videoId ?? new URL(r.url).searchParams.get("v") ?? "",
      title: r.title,
    }))
    .filter((r) => r.videoId);

  let formatMap = new Map<string, VideoFormat>();
  if (ytForClassify.length > 0) {
    try {
      const classified = await callLLMJSON<
        { videos: { videoId: string; format: VideoFormat }[] }
      >(
        `Klassifiziere Videos in genau eines: talking_head, tutorial, story, b_roll.`,
        JSON.stringify({ nische, titles: ytForClassify }),
        `{ "videos": [{ "videoId": "string", "format": "talking_head|tutorial|story|b_roll" }] }`
      );
      formatMap = new Map(classified.videos.map((v) => [v.videoId, v.format]));
    } catch {
      /* Formate bleiben Default */
    }
  }

  return raw.map((r) => {
    const videoId =
      r.videoId ??
      (r.platform === "youtube" && r.url.includes("watch?v=")
        ? (() => {
            try {
              return new URL(r.url).searchParams.get("v") ?? undefined;
            } catch {
              return undefined;
            }
          })()
        : undefined);

    return {
      ...r,
      videoId,
      format:
        videoId && formatMap.has(videoId)
          ? formatMap.get(videoId)!
          : r.format,
      viewCount: videoId ? viewCounts[videoId] : r.viewCount,
    };
  });
}
