import { forceMockOnly } from "@/lib/demo/mockOnly";

export interface WebResearchResult {
  snippets: string[];
  source: "tavily" | "perplexity" | "fallback";
}

async function searchTavily(queries: string[]): Promise<WebResearchResult> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY fehlt");

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
  return { snippets, source: "tavily" };
}

async function searchPerplexity(queries: string[]): Promise<WebResearchResult> {
  const apiKey = process.env.PERPLEXITY_API_KEY;
  if (!apiKey) throw new Error("PERPLEXITY_API_KEY fehlt");

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
            content: `Recherchiere kurz und faktenbasiert: ${query}. Bullet Points.`,
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
  return { snippets, source: "perplexity" };
}

export async function runWebResearch(nische: string): Promise<WebResearchResult> {
  const queries = [
    `${nische} Zielgruppe Social Media Video Content`,
    `${nische} größte Pain Points Probleme Zielgruppe`,
    `${nische} virale Hooks Video Formate Trends`,
  ];

  if (forceMockOnly()) {
    return {
      source: "fallback",
      snippets: [
        `Nische: ${nische} — Demo-Modus (Mock), keine Web-APIs.`,
        "Typische Zielgruppe: Einsteiger und Fortgeschrittene in der Nische.",
        "Pain Points: Zeitmangel, Sichtbarkeit, fehlende Struktur beim Content.",
      ],
    };
  }

  if (process.env.TAVILY_API_KEY) {
    try {
      return await searchTavily(queries);
    } catch {
      /* fall through */
    }
  }
  if (process.env.PERPLEXITY_API_KEY) {
    try {
      return await searchPerplexity(queries);
    } catch {
      /* fall through */
    }
  }

  return {
    source: "fallback",
    snippets: [
      `Nische: ${nische} — keine Web-API-Keys gesetzt; Claude nutzt Allgemeinwissen.`,
      "Typische Zielgruppe: Einsteiger und Fortgeschrittene in der Nische.",
      "Pain Points: Zeitmangel, Sichtbarkeit, fehlende Struktur beim Content.",
    ],
  };
}
