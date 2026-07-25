import { isLlmConfigured, callLLMJSON } from "@/lib/llm";
import type { Platform, ReferenzVideo, ResearchResult, VideoFormat } from "@/lib/types";
import {
  parseReferencePlatforms,
  platformHasReferenceApi,
  type ReferencePlatform,
} from "@/lib/platforms/config";

interface YtSearchItem {
  id?: { videoId?: string };
  snippet?: { title?: string };
}

async function youtubeSearch(
  query: string,
  maxResults: number
): Promise<ReferenzVideo[]> {
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
      url: `https://www.youtube.com/watch?v=${item.id?.videoId ?? ""}`,
      title: item.snippet?.title ?? "Unbekannt",
      format: "talking_head" as VideoFormat,
      platform: "youtube" as Platform,
    }))
    .filter((v) => v.videoId);
}

async function llmReferenzCandidates(
  platform: ReferencePlatform,
  nische: string,
  research: ResearchResult,
  count: number
): Promise<ReferenzVideo[]> {
  const result = await callLLMJSON<{ videos: ReferenzVideo[] }>(
    `Du lieferst ${count} öffentliche Referenz-Video-Ideen für ${platform}. Nur realistische Titel, passendes Format (talking_head|tutorial|story|b_roll), URL als Such- oder Profil-Link (keine erfundenen Video-IDs).`,
    JSON.stringify({ nische, painPoints: research.painPoints, platform }),
    `{ "videos": [{ "url", "title", "format", "platform": "${platform}" }] }`
  );

  return (result.videos ?? []).slice(0, count).map((v) => ({
    ...v,
    platform,
  }));
}

function staticFallback(
  platform: ReferencePlatform,
  nische: string
): ReferenzVideo[] {
  const q = encodeURIComponent(nische);
  switch (platform) {
    case "youtube":
      return [
        {
          url: "https://www.youtube.com/results?search_query=" + q,
          title: `${nische} — YouTube Inspiration`,
          format: "talking_head",
          platform: "youtube",
        },
      ];
    case "tiktok":
      return [
        {
          url: `https://www.tiktok.com/search?q=${q}`,
          title: `${nische} — TikTok Trends`,
          format: "talking_head",
          platform: "tiktok",
        },
      ];
    case "instagram":
      return [
        {
          url: `https://www.instagram.com/explore/tags/${q.replace(/%20/g, "")}/`,
          title: `${nische} — Instagram Reels / Meta`,
          format: "story",
          platform: "instagram",
        },
      ];
    case "linkedin":
      return [
        {
          url: `https://www.linkedin.com/search/results/content/?keywords=${q}`,
          title: `${nische} — LinkedIn Video-Posts`,
          format: "talking_head",
          platform: "linkedin",
        },
      ];
  }
}

async function searchPlatform(
  platform: ReferencePlatform,
  nische: string,
  research: ResearchResult
): Promise<ReferenzVideo[]> {
  const query = `${nische} ${research.painPoints[0] ?? ""}`;

  if (platform === "youtube") {
    let items = await youtubeSearch(query, 4);
    if (items.length === 0) items = await youtubeSearch(nische, 3);
    if (items.length > 0) return items;
  }

  if (platformHasReferenceApi(platform) && platform !== "youtube") {
    // Reserviert für Graph / TikTok / LinkedIn API — bis dahin LLM-Katalog
    try {
      return await llmReferenzCandidates(platform, nische, research, 3);
    } catch {
      return staticFallback(platform, nische);
    }
  }

  if (isLlmConfigured()) {
    try {
      return await llmReferenzCandidates(platform, nische, research, 2);
    } catch {
      /* fall through */
    }
  }

  return staticFallback(platform, nische);
}

export async function findReferenzVideosMultiPlatform(
  nische: string,
  research: ResearchResult
): Promise<ReferenzVideo[]> {
  const platforms = parseReferencePlatforms();
  const batches = await Promise.all(
    platforms.map((p) => searchPlatform(p, nische, research))
  );
  const merged = batches.flat();
  const seen = new Set<string>();
  const unique: ReferenzVideo[] = [];
  for (const v of merged) {
    const key = `${v.platform ?? ""}:${v.url}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(v);
  }
  return unique.slice(0, 12);
}
