import { forceMockOnly } from "@/lib/demo/mockOnly";
import { anthropicText } from "@/lib/llm/providers/anthropic";
import { claudeCliResearch } from "@/lib/llm/providers/claudeCli";
import { geminiText } from "@/lib/llm/providers/gemini";
import { firecrawlSearch } from "@/lib/trends/firecrawlClient";

export type WebResearchProviderId =
  | "auto"
  | "firecrawl"
  | "perplexity"
  | "tavily"
  | "gemini"
  | "claude";

export type WebResearchSource =
  | "firecrawl"
  | "tavily"
  | "perplexity"
  | "gemini"
  | "claude"
  | "fallback";

export interface WebResearchResult {
  snippets: string[];
  source: WebResearchSource;
  providerUsed: WebResearchProviderId | WebResearchSource;
}

export const RESEARCH_WEB_PROVIDER_OPTIONS: {
  id: WebResearchProviderId;
  label: string;
  detail: string;
}[] = [
  {
    id: "auto",
    label: "Auto",
    detail: "Firecrawl → Perplexity → Tavily → Gemini → Claude",
  },
  {
    id: "firecrawl",
    label: "Firecrawl",
    detail: "Web-Suche & Seiten-Snippets",
  },
  {
    id: "perplexity",
    label: "Perplexity",
    detail: "Sonar-Recherche (Chat)",
  },
  {
    id: "tavily",
    label: "Tavily",
    detail: "Klassische Web-Suche",
  },
  {
    id: "gemini",
    label: "Gemini Research",
    detail: "Dein Gemini-LLM-Key (kein Extra-LLM)",
  },
  {
    id: "claude",
    label: "Claude Research",
    detail: "Dein Anthropic-LLM-Key (kein Extra-LLM)",
  },
];

const PROVIDER_IDS = new Set<WebResearchProviderId>(
  RESEARCH_WEB_PROVIDER_OPTIONS.map((o) => o.id)
);

export function parseWebResearchProvider(
  value: unknown
): WebResearchProviderId {
  if (typeof value === "string" && PROVIDER_IDS.has(value as WebResearchProviderId)) {
    return value as WebResearchProviderId;
  }
  return defaultWebResearchProvider();
}

export function defaultWebResearchProvider(): WebResearchProviderId {
  const env = process.env.RESEARCH_WEB_PROVIDER?.trim().toLowerCase();
  if (env && PROVIDER_IDS.has(env as WebResearchProviderId)) {
    return env as WebResearchProviderId;
  }
  return "auto";
}

export function buildNischeQueries(nische: string): string[] {
  return [
    `${nische} Zielgruppe Social Media Video Content`,
    `${nische} größte Pain Points Probleme Zielgruppe`,
    `${nische} virale Hooks Video Formate Trends`,
  ];
}

function fallbackSnippets(topic: string): WebResearchResult {
  return {
    source: "fallback",
    providerUsed: "fallback",
    snippets: [
      `Nische: ${topic} — keine Web-API-Keys gesetzt; LLM nutzt Allgemeinwissen.`,
      "Typische Zielgruppe: Einsteiger und Fortgeschrittene in der Nische.",
      "Pain Points: Zeitmangel, Sichtbarkeit, fehlende Struktur beim Content.",
    ],
  };
}

function mockSnippets(topic: string): WebResearchResult {
  return {
    source: "fallback",
    providerUsed: "auto",
    snippets: [
      `Nische: ${topic} — Demo-Modus (Mock), keine Web-APIs.`,
      "Typische Zielgruppe: Einsteiger und Fortgeschrittene in der Nische.",
      "Pain Points: Zeitmangel, Sichtbarkeit, fehlende Struktur beim Content.",
    ],
  };
}

async function searchTavily(queries: string[]): Promise<WebResearchResult | null> {
  const apiKey = process.env.TAVILY_API_KEY?.trim();
  if (!apiKey) return null;

  const snippets: string[] = [];
  for (const query of queries) {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        max_results: 5,
      }),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as {
      results?: { title?: string; content?: string }[];
    };
    for (const r of data.results ?? []) {
      snippets.push(`${r.title ?? "Treffer"}: ${r.content ?? ""}`);
    }
  }
  return snippets.length
    ? { snippets, source: "tavily", providerUsed: "tavily" }
    : null;
}

async function searchPerplexity(
  queries: string[]
): Promise<WebResearchResult | null> {
  const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
  if (!apiKey) return null;

  const snippets: string[] = [];
  for (const query of queries) {
    const res = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          {
            role: "user",
            content: `Recherchiere kurz und faktenbasiert: ${query}. Bullet Points, deutsch.`,
          },
        ],
      }),
    });
    if (!res.ok) continue;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = data.choices?.[0]?.message?.content;
    if (text) snippets.push(text);
  }
  return snippets.length
    ? { snippets, source: "perplexity", providerUsed: "perplexity" }
    : null;
}

async function searchFirecrawl(
  queries: string[]
): Promise<WebResearchResult | null> {
  const snippets: string[] = [];
  for (const query of queries) {
    const { hits, source } = await firecrawlSearch(query);
    if (source !== "firecrawl") continue;
    for (const h of hits) {
      snippets.push(
        `[${h.title ?? "Treffer"}] ${h.description ?? ""}\n${h.markdown ?? ""}`.trim()
      );
    }
  }
  return snippets.length
    ? { snippets, source: "firecrawl", providerUsed: "firecrawl" }
    : null;
}

const RESEARCH_SYSTEM =
  "Du bist Research-Assistent für Social-Media- und Video-Content-Strategie. Antworte faktenorientiert auf Deutsch, mit Bullet Points.";

async function searchGeminiResearch(
  queries: string[]
): Promise<WebResearchResult | null> {
  const hasKey = Boolean(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() ||
      process.env.GEMINI_API_KEY?.trim()
  );
  if (!hasKey) return null;

  const model =
    process.env.GEMINI_MODEL?.trim() ||
    process.env.LLM_MODEL?.trim() ||
    "gemini-2.0-flash";
  const snippets: string[] = [];
  for (const query of queries) {
    try {
      const text = await geminiText(
        model,
        RESEARCH_SYSTEM,
        `Recherchiere aktuelle Trends und Fakten zu: ${query}`
      );
      if (text) snippets.push(text);
    } catch {
      /* nächste Query */
    }
  }
  return snippets.length
    ? { snippets, source: "gemini", providerUsed: "gemini" }
    : null;
}

async function searchClaudeResearch(
  queries: string[]
): Promise<WebResearchResult | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  // Kein API-Key, aber CLI-Backend aktiv → echte Web-Recherche über die `claude` CLI (WebSearch).
  if (!apiKey) {
    const provider = (process.env.LLM_PROVIDER ?? "anthropic").toLowerCase();
    if (provider !== "claude-cli") return null;
    const model = process.env.LLM_MODEL?.trim() || "sonnet";
    try {
      const text = await claudeCliResearch(model, queries);
      return text.trim()
        ? { snippets: [text.trim()], source: "claude", providerUsed: "claude" }
        : null;
    } catch {
      return null;
    }
  }

  const model =
    process.env.ANTHROPIC_MODEL?.trim() ||
    process.env.LLM_MODEL?.trim() ||
    "claude-sonnet-4-20250514";
  const snippets: string[] = [];
  for (const query of queries) {
    try {
      const text = await anthropicText(
        model,
        apiKey,
        RESEARCH_SYSTEM,
        `Recherchiere aktuelle Trends und Fakten zu: ${query}`
      );
      if (text) snippets.push(text);
    } catch {
      /* nächste Query */
    }
  }
  return snippets.length
    ? { snippets, source: "claude", providerUsed: "claude" }
    : null;
}

type ProviderRunner = (queries: string[]) => Promise<WebResearchResult | null>;

const AUTO_CHAIN: ProviderRunner[] = [
  searchFirecrawl,
  searchPerplexity,
  searchTavily,
  searchGeminiResearch,
  searchClaudeResearch,
];

const SINGLE: Record<
  Exclude<WebResearchProviderId, "auto">,
  ProviderRunner
> = {
  firecrawl: searchFirecrawl,
  perplexity: searchPerplexity,
  tavily: searchTavily,
  gemini: searchGeminiResearch,
  claude: searchClaudeResearch,
};

export async function runWebResearchWithProvider(
  topic: string,
  provider: WebResearchProviderId = defaultWebResearchProvider(),
  options?: { queries?: string[] }
): Promise<WebResearchResult> {
  const queries = options?.queries?.length
    ? options.queries
    : buildNischeQueries(topic);

  if (forceMockOnly()) {
    return mockSnippets(topic);
  }

  if (provider === "auto") {
    for (const run of AUTO_CHAIN) {
      const result = await run(queries);
      if (result?.snippets.length) {
        return { ...result, providerUsed: "auto" };
      }
    }
    return fallbackSnippets(topic);
  }

  const result = await SINGLE[provider](queries);
  if (result?.snippets.length) return result;
  return fallbackSnippets(topic);
}

export function webResearchSourceLabel(source: WebResearchSource | string): string {
  switch (source) {
    case "firecrawl":
      return "Firecrawl";
    case "perplexity":
      return "Perplexity";
    case "tavily":
      return "Tavily";
    case "gemini":
      return "Gemini Research";
    case "claude":
      return "Claude Research";
    case "fallback":
      return "Fallback (kein Live-Web)";
    default:
      return source;
  }
}
