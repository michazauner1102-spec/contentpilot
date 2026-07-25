import { callClaudeJSON } from "@/lib/claude";
import type { ReferenzVideo, ResearchResult, VideoFormat } from "@/lib/types";

interface YtSearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string };
}

async function youtubeSearch(
  query: string,
  maxResults: number
): Promise<{ videoId: string; title: string }[]> {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return [];

  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("order", "viewCount");
  url.searchParams.set("key", key);

  const res = await fetch(url.toString());
  if (!res.ok) return [];

  const data = (await res.json()) as { items?: YtSearchItem[] };
  return (data.items ?? [])
    .map((item) => ({
      videoId: item.id?.videoId ?? "",
      title: item.snippet?.title ?? "Unbekannt",
    }))
    .filter((v) => v.videoId);
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

  const data = (await res.json()) as {
    items?: { id?: string; statistics?: { viewCount?: string } }[];
  };
  const map: Record<string, number> = {};
  for (const item of data.items ?? []) {
    if (item.id) {
      map[item.id] = parseInt(item.statistics?.viewCount ?? "0", 10);
    }
  }
  return map;
}

function fallbackReferenzen(nische: string): ReferenzVideo[] {
  return [
    {
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      title: `${nische} — Talking Head Beispiel`,
      format: "talking_head",
    },
    {
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      title: `${nische} — Tutorial Format`,
      format: "tutorial",
    },
    {
      url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
      title: `${nische} — Story Format`,
      format: "story",
    },
  ];
}

export async function findReferenzVideos(
  nische: string,
  research: ResearchResult
): Promise<ReferenzVideo[]> {
  const query = `${nische} ${research.painPoints[0] ?? ""} short video`;
  let raw = await youtubeSearch(query, 8);

  if (raw.length === 0) {
    raw = await youtubeSearch(nische, 5);
  }

  if (raw.length === 0) {
    return fallbackReferenzen(nische);
  }

  const viewCounts = await fetchViewCounts(raw.map((r) => r.videoId));

  const classified = await callClaudeJSON<
    { videos: { videoId: string; format: VideoFormat }[] }
  >(
    `Klassifiziere YouTube-Videos in genau eines: talking_head, tutorial, story, b_roll.`,
    JSON.stringify({ nische, titles: raw }),
    `{ "videos": [{ "videoId": "string", "format": "talking_head|tutorial|story|b_roll" }] }`
  );

  const formatMap = new Map(
    classified.videos.map((v) => [v.videoId, v.format])
  );

  return raw.map((r) => ({
    videoId: r.videoId,
    url: `https://www.youtube.com/watch?v=${r.videoId}`,
    title: r.title,
    format: formatMap.get(r.videoId) ?? "talking_head",
    viewCount: viewCounts[r.videoId],
  }));
}
