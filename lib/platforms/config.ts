import type { Platform } from "@/lib/types";
import { forceMockOnly } from "@/lib/demo/mockOnly";

export type ReferencePlatform = Platform;

const ALL: ReferencePlatform[] = [
  "youtube",
  "instagram",
  "tiktok",
  "linkedin",
];

export function parseReferencePlatforms(): ReferencePlatform[] {
  const raw = process.env.REFERENCE_PLATFORMS?.trim();
  if (!raw) return ALL;
  const allowed = new Set(ALL);
  const picked = raw
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean) as ReferencePlatform[];
  const valid = picked.filter((p) => allowed.has(p));
  return valid.length > 0 ? valid : ALL;
}

export function platformHasReferenceApi(platform: ReferencePlatform): boolean {
  if (forceMockOnly()) return false;
  switch (platform) {
    case "youtube":
      return Boolean(process.env.YOUTUBE_API_KEY?.trim());
    case "instagram":
      return Boolean(
        process.env.META_ACCESS_TOKEN?.trim() ||
          process.env.INSTAGRAM_ACCESS_TOKEN?.trim()
      );
    case "tiktok":
      return Boolean(
        process.env.TIKTOK_CLIENT_KEY?.trim() &&
          process.env.TIKTOK_CLIENT_SECRET?.trim()
      );
    case "linkedin":
      return Boolean(process.env.LINKEDIN_ACCESS_TOKEN?.trim());
    default:
      return false;
  }
}

export function platformHasInsightsApi(platform: ReferencePlatform): boolean {
  if (forceMockOnly()) return false;
  switch (platform) {
    case "youtube":
      return Boolean(
        process.env.YOUTUBE_API_KEY?.trim() &&
          process.env.YOUTUBE_OAUTH_REFRESH_TOKEN?.trim()
      );
    case "instagram":
      return Boolean(
        process.env.META_ACCESS_TOKEN?.trim() &&
          process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID?.trim()
      );
    case "tiktok":
      return Boolean(process.env.TIKTOK_ACCESS_TOKEN?.trim());
    case "linkedin":
      return Boolean(
        process.env.LINKEDIN_ACCESS_TOKEN?.trim() &&
          process.env.LINKEDIN_ORGANIZATION_URN?.trim()
      );
    default:
      return false;
  }
}

export function configuredInsightsPlatforms(): ReferencePlatform[] {
  return ALL.filter(platformHasInsightsApi);
}
