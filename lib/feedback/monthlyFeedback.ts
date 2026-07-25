import { callClaudeJSON } from "@/lib/claude";
import { generateCommentSamplesForPerformance } from "@/lib/insights/commentSamples";
import type { VideoWithInsights } from "@/lib/insights/types";
import { DEMO_LEARNINGS } from "@/lib/demo/mockData";
import type {
  AnalyzedComment,
  CommentKategorie,
  LoopAnalysisResult,
  MonthlyFeedbackDocument,
  ResearchResult,
  SocialComment,
} from "@/lib/types";

function isSpam(text: string): boolean {
  const t = text.toLowerCase();
  return (
    t.includes("check profile") ||
    t.includes("folgt mir") ||
    t.includes("free tips") ||
    /^[\s❤️🔥✨]+$/.test(text.trim()) ||
    text.trim().length < 4
  );
}

function heuristicCategory(text: string): CommentKategorie {
  const t = text.toLowerCase();
  if (isSpam(text)) return "spam";
  if (t.includes("anfrage") || t.includes("dm") || t.includes("schick mir"))
    return "lead";
  if (t.includes("?") || t.includes("wie ") || t.includes("was kostet"))
    return "frage";
  if (t.includes("fake") || t.includes("langsam") || t.includes("lang"))
    return "kritik";
  if (t.includes("danke") || t.includes("gespeichert") || t.includes("stark"))
    return "lob";
  return "feedback";
}

function heuristicAnalyze(comments: SocialComment[]): AnalyzedComment[] {
  return comments.map((c) => {
    const kategorie = heuristicCategory(c.text);
    const sinnvoll =
      kategorie !== "spam" &&
      !isSpam(c.text) &&
      c.text.trim().length >= 8;
    let handlungsempfehlung: string | undefined;
    if (kategorie === "lead") {
      handlungsempfehlung =
        "Innerhalb von 24 h antworten oder CTA-Video mit FAQ verlinken.";
    } else if (kategorie === "frage") {
      handlungsempfehlung =
        "Als Stichpunkt für nächstes Q&A-Reel oder Kommentar-Pin sammeln.";
    } else if (kategorie === "kritik") {
      handlungsempfehlung =
        "Hook/Tempo prüfen — ggf. Schnitt in den ersten 3 Sekunden straffen.";
    }
    return {
      ...c,
      sinnvoll,
      kategorie,
      zusammenfassung: sinnvoll
        ? `Relevanter ${kategorie}-Kommentar zu „${c.videoTitle}".`
        : "Wenig Substanz — nicht priorisieren.",
      handlungsempfehlung,
    };
  });
}

async function analyzeCommentsWithLlm(
  comments: SocialComment[]
): Promise<AnalyzedComment[]> {
  const sample = comments.slice(0, 40);
  const result = await callClaudeJSON<{ comments: AnalyzedComment[] }>(
    `Du analysierst Social-Media-Kommentare auf Deutsch für einen Creator.
Pro Kommentar: sinnvoll (true wenn Frage, Lead, konstruktives Feedback, Lob mit Substanz),
kategorie (frage|feedback|lead|kritik|lob|spam), kurze zusammenfassung, optional handlungsempfehlung.
Spam, Emoji-only und „follow me" = sinnvoll false.`,
    `Kommentare:
${JSON.stringify(sample, null, 2)}`,
    `{ "comments": [{ "id": "", "videoId": "", "videoTitle": "", "postingDay": 0, "platform": "instagram", "text": "", "sinnvoll": true, "kategorie": "frage", "zusammenfassung": "", "handlungsempfehlung": "" }] }`
  );
  const byId = new Map(result.comments.map((c) => [c.id, c]));
  return comments.map(
    (c) =>
      byId.get(c.id) ?? {
        ...heuristicAnalyze([c])[0],
      }
  );
}

function metricsSummary(videos: VideoWithInsights[]): string {
  const totalViews = videos.reduce((s, v) => s + v.metrics.views, 0);
  const totalComments = videos.reduce((s, v) => s + v.metrics.comments, 0);
  const top = [...videos]
    .sort((a, b) => b.metrics.views - a.metrics.views)
    .slice(0, 5)
    .map(
      (v) =>
        `- Tag ${v.postingDay} ${v.title}: ${v.metrics.views} Views, ${v.metrics.comments} Kommentare`
    )
    .join("\n");
  return `Videos: ${videos.length}, Views gesamt: ${totalViews}, Kommentare gesamt: ${totalComments}
Top Performer:
${top}`;
}

export async function generateMonthlyFeedbackDocument(input: {
  nische: string;
  monat: string;
  performance: VideoWithInsights[];
  learnings?: LoopAnalysisResult | null;
  research?: ResearchResult | null;
}): Promise<MonthlyFeedbackDocument> {
  const { nische, monat, performance, research } = input;
  const learnings = input.learnings?.length
    ? input.learnings
    : undefined;
  const erstelltAm = new Date().toISOString();
  const comments = generateCommentSamplesForPerformance(performance);

  let analyzed: AnalyzedComment[];
  try {
    analyzed = await analyzeCommentsWithLlm(comments);
  } catch {
    analyzed = heuristicAnalyze(comments);
  }

  const sinnvolle = analyzed.filter((c) => c.sinnvoll);
  const highlights = [
    ...sinnvolle.filter((c) => c.kategorie === "lead" || c.kategorie === "frage"),
    ...sinnvolle.filter((c) => c.kategorie === "kritik" || c.kategorie === "feedback"),
  ]
    .slice(0, 12)
    .concat(analyzed.filter((c) => !c.sinnvoll && c.kategorie === "spam").slice(0, 2));

  const kommentarBlock = {
    gesamtKommentare: comments.length,
    sinnvolleAnzahl: sinnvolle.length,
    highlights: highlights.slice(0, 14),
    themenAusKommentaren: [] as string[],
    zuIgnorieren: [] as string[],
  };

  try {
    const doc = await callClaudeJSON<{
      executiveSummary: string;
      trends: string[];
      wasGut: string[];
      wasSchlecht: string[];
      konkreteVorschlaege: MonthlyFeedbackDocument["konkreteVorschlaege"];
      kommentarAnalyse?: {
        themenAusKommentaren?: string[];
        zuIgnorieren?: string[];
      };
    }>(
      `Du erstellst ein Monats-Feedback-Dokument für Social-Media-Content auf Deutsch.
Konkret, keine Floskeln. Trends aus Metriken und Kommentaren. Vorschläge umsetzbar (Formate, Hooks, Posting, Community).
wasGut / wasSchlecht je 3-5 Punkte. konkreteVorschlaege 4-6 mit prioritaet.`,
      `Nische: ${nische}
Monat: ${monat}

Metriken:
${metricsSummary(performance)}

Research:
${research ? JSON.stringify(research) : "—"}

Loop-Learnings:
${learnings ? JSON.stringify(learnings) : "—"}

Kommentare (analysiert):
${JSON.stringify(analyzed.slice(0, 35), null, 2)}`,
      `{
  "executiveSummary": "",
  "trends": ["3-5 strings"],
  "wasGut": ["3-5 strings"],
  "wasSchlecht": ["3-5 strings"],
  "konkreteVorschlaege": [{ "titel": "", "beschreibung": "", "prioritaet": "hoch" }],
  "kommentarAnalyse": {
    "themenAusKommentaren": ["3-5 strings"],
    "zuIgnorieren": ["2-4 strings"]
  }
}`
    );

    kommentarBlock.themenAusKommentaren =
      doc.kommentarAnalyse?.themenAusKommentaren ?? [];
    kommentarBlock.zuIgnorieren = doc.kommentarAnalyse?.zuIgnorieren ?? [];

    return {
      monat,
      nische,
      erstelltAm,
      executiveSummary: doc.executiveSummary,
      trends: doc.trends,
      wasGut: doc.wasGut,
      wasSchlecht: doc.wasSchlecht,
      konkreteVorschlaege: doc.konkreteVorschlaege,
      kommentarAnalyse: kommentarBlock,
      learningsByBereich: learnings,
    };
  } catch {
    return buildMockMonthlyFeedback({
      nische,
      monat,
      erstelltAm,
      performance,
      learnings,
      kommentarBlock,
      analyzed,
    });
  }
}

function buildMockMonthlyFeedback(args: {
  nische: string;
  monat: string;
  erstelltAm: string;
  performance: VideoWithInsights[];
  learnings?: LoopAnalysisResult;
  kommentarBlock: MonthlyFeedbackDocument["kommentarAnalyse"];
  analyzed: AnalyzedComment[];
}): MonthlyFeedbackDocument {
  const { nische, monat, erstelltAm, performance, learnings, analyzed } = args;
  const kommentarBlock = { ...args.kommentarBlock };

  const leads = analyzed.filter((c) => c.kategorie === "lead" && c.sinnvoll);
  const fragen = analyzed.filter((c) => c.kategorie === "frage" && c.sinnvoll);

  kommentarBlock.themenAusKommentaren = [
    ...new Set(
      [
        fragen.length ? "Preis- und Ablauf-Fragen häufen sich" : null,
        leads.length ? "Direkte Anfragen über Kommentar-Keyword" : null,
        "Wunsch nach Branchen-Varianten (z. B. andere Gewerke)",
        "Lob für authentische BTS-Stories",
      ].filter(Boolean) as string[]
    ),
  ];
  kommentarBlock.zuIgnorieren = [
    "Emoji-only und Follow-for-tips-Spam",
    "Off-Topic-Werbung in Kommentaren",
    "Troll-Kommentare ohne konkreten Bezug zum Video",
  ];

  const loop = learnings ?? DEMO_LEARNINGS;
  const wasGut = loop.flatMap((l) => l.hatFunktioniert).slice(0, 5);
  const wasSchlecht = loop.flatMap((l) => l.hatNichtFunktioniert).slice(0, 5);

  return {
    monat,
    nische,
    erstelltAm,
    mock: true,
    executiveSummary: `Im ${monat} hast du ${performance.length} geplante Videos ausgewertet. Stärkste Signale: Tutorial-Hooks und ehrliche Ablauf-Videos. In den Kommentaren stecken ${kommentarBlock.sinnvolleAnzahl} nutzbare Hinweise (Fragen, Leads, Feedback) — darauf solltest du Plan v2 und Q&A-Content aufbauen.`,
    trends: [
      "Kurze Tutorials mit Zahl im Hook outperformen reine Talking-Head-Motivation",
      "Speicher-Rate steigt bei Schritt-für-Schritt-Formaten (Vertrauen)",
      "Conversion-Videos mit klarem Kommentar-CTA erzeugen DM-Leads",
      "LinkedIn-Kommentare eher fachliche Fragen, TikTok eher Reichweiten-Diskussion",
    ],
    wasGut: wasGut.length ? wasGut : ["Klare Hook-Struktur in Woche 1"],
    wasSchlecht: wasSchlecht.length
      ? wasSchlecht
      : ["Zu lange Einleitungen ohne Pattern Interrupt"],
    konkreteVorschlaege: [
      {
        titel: "Q&A-Reel aus Top-Kommentaren",
        beschreibung:
          "Die 3 häufigsten Fragen aus diesem Monat in einem Reichweite-Video beantworten — Hook: „Ihr habt gefragt …“",
        prioritaet: "hoch",
      },
      {
        titel: "Lead-Kommentare innerhalb 24 h beantworten",
        beschreibung:
          "Vorlage für DM-Antwort + Link auf Conversion-Video. Metrik: Antwortrate tracken.",
        prioritaet: "hoch",
      },
      {
        titel: "Tutorial-Anteil in Woche 1 erhöhen",
        beschreibung:
          "Basierend auf Loop-Learning: 2 zusätzliche Tutorial-Tage statt generischer Hooks.",
        prioritaet: "mittel",
      },
      {
        titel: "Spam-Kommentare nicht einzeln liken",
        beschreibung:
          "Moderation: Pin nur sinnvolle Fragen; Rest ausblenden — Fokus auf Community-Qualität.",
        prioritaet: "niedrig",
      },
    ],
    kommentarAnalyse: kommentarBlock,
    learningsByBereich: loop,
  };
}
