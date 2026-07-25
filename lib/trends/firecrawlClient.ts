export interface FirecrawlSearchHit {
  title?: string;
  url?: string;
  description?: string;
  markdown?: string;
}

export async function firecrawlSearch(
  query: string,
  limit = 6
): Promise<{ hits: FirecrawlSearchHit[]; source: "firecrawl" | "fallback" }> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) {
    return { hits: [], source: "fallback" };
  }

  const res = await fetch("https://api.firecrawl.dev/v1/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit,
      lang: "de",
      country: "de",
      scrapeOptions: { formats: ["markdown"] },
    }),
  });

  if (!res.ok) {
    return { hits: [], source: "fallback" };
  }

  const data = (await res.json()) as {
    data?: {
      title?: string;
      url?: string;
      description?: string;
      markdown?: string;
    }[];
  };

  const hits = (data.data ?? []).map((item) => ({
    title: item.title,
    url: item.url,
    description: item.description,
    markdown: item.markdown?.slice(0, 1500),
  }));

  return { hits, source: "firecrawl" };
}
