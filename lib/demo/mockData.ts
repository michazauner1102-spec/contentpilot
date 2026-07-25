import type {
  LoopAnalysisResult,
  Platform,
  ResearchResult,
  VideoDetails,
  Zyklus,
} from "@/lib/types";
import { DEFAULT_BEREICH_MIX } from "@/lib/types";
import type { VideoWithInsights } from "@/lib/insights/types";

export const DEMO_NISCHE = "Personal Branding für Handwerker";

export const DEMO_RESEARCH: ResearchResult = {
  zielgruppe:
    "Selbstständige Handwerker (25–45), die regional sichtbar werden wollen, aber wenig Zeit für Content haben.",
  painPoints: [
    "Keine Ideen, was man filmen soll",
    "Angst vor Kamera und peinlich wirkenden Videos",
    "Viel Aufwand, wenig messbare Anfragen",
  ],
  hookMuster: [
    "„Die 3 Fehler, die jeder Handwerker auf Instagram macht“",
    "„So bekommst du in 7 Tagen deine erste Anfrage über Reels“",
    "POV: Kunde fragt nach Preis — so antwortest du",
  ],
  tonality: "Direkt, bodenständig, ohne Marketing-Buzzwords",
};

const DETAIL_DAYS = new Set([1, 5, 10, 15, 20, 25]);

function makeVideo(day: number): VideoDetails {
  const bereich =
    day <= 18 ? "reichweite" : day <= 26 ? "vertrauen" : "conversion";
  const formats = ["talking_head", "tutorial", "story", "b_roll"] as const;
  const format = formats[(day - 1) % 4];
  const platforms = ["instagram", "youtube", "tiktok"] as const;
  const platform = platforms[(day - 1) % 3];
  const id = `demo-day-${String(day).padStart(2, "0")}`;

  const detailed = DETAIL_DAYS.has(day);

  return {
    id,
    postingDay: day,
    bereich,
    format,
    platform,
    title:
      bereich === "reichweite"
        ? `Reichweite-Hook Tag ${day}`
        : bereich === "vertrauen"
          ? `Vertrauens-Story Tag ${day}`
          : `Conversion-Angebot Tag ${day}`,
    hook:
      bereich === "reichweite"
        ? "Stop — bevor du das nächste Reel drehst, hör das hier."
        : bereich === "vertrauen"
          ? "Ich zeige dir heute den echten Ablauf hinter meinem Projekt."
          : "Du willst Anfragen? Dann mach genau diesen einen Schritt.",
    begruendung: `Passt zum Mix (${bereich}) und zur Demo-Nische Handwerker.`,
    skript: detailed
      ? {
          hook: "Kurzer Pattern-Interrupt in den ersten 2 Sekunden.",
          body: "Ein konkretes Beispiel aus dem Handwerksalltag — Problem, Lösung, Beweis.",
          cta:
            bereich === "conversion"
              ? "Link in Bio — kostenloses Erstgespräch buchen."
              : bereich === "vertrauen"
                ? "Speichern, wenn du das nächste Mal vor der Kamera stehst."
                : "Teil 2 kommt morgen — folgen, wenn du den Rest willst.",
        }
      : { hook: "", body: "", cta: "" },
    grafikVorschlag: detailed
      ? "Großer Text-Overlay: „3 Fehler“ + Gesicht links, Werkzeug rechts, hoher Kontrast."
      : "",
    referenzVideoUrl: detailed ? "https://www.youtube.com/watch?v=jNQXAC9IVRw" : "",
    referenzBegruendung: detailed
      ? "Kurzes Talking-Head mit starkem Einstieg — ähnliche Zielgruppe."
      : "",
    drehAnleitung: detailed
      ? [
          {
            setting: "Werkstatt, Tageslicht",
            einstellungsgroesse: "Halbtotale",
            inhalt: "Du sprichst direkt in die Kamera",
            ungefaehreDauerSekunden: 8,
          },
          {
            setting: "Detail B-Roll",
            einstellungsgroesse: "Nahaufnahme",
            inhalt: "Hände an Werkzeug / Ergebnis",
            ungefaehreDauerSekunden: 5,
          },
        ]
      : [],
  };
}

export function buildDemoZyklus(version: 1 | 2): Zyklus {
  const plan = Array.from({ length: 30 }, (_, i) => makeVideo(i + 1));
  if (version === 2) {
    for (const v of plan) {
      if (v.bereich === "reichweite" && v.postingDay % 3 === 0) {
        v.format = "tutorial";
        v.hook = `[v2] Tutorial-Hook: So machst du Tag ${v.postingDay} in 10 Minuten.`;
      }
    }
  }
  return {
    id: `demo-v${version}`,
    nische: DEMO_NISCHE,
    monat: "2026-07",
    plan,
    bereichMix: DEFAULT_BEREICH_MIX,
  };
}

export const DEMO_LEARNINGS: LoopAnalysisResult = [
  {
    bereich: "reichweite",
    hatFunktioniert: [
      "Tutorial-Hooks mit klarer Zahl in den ersten 2 Sekunden",
      "Talking Head + schneller B-Roll-Wechsel alle 3 s",
    ],
    hatNichtFunktioniert: [
      "Generische Motivations-Hooks ohne konkretes Versprechen",
      "Reine B-Roll-Clips ohne Gesicht",
    ],
    naechsteHebel: [
      "Mehr Tutorial-Format in Woche 1",
      "Hooks mit „Fehler“-Frame testen",
      "Pattern-Interrupt vor dem Logo",
    ],
  },
  {
    bereich: "vertrauen",
    hatFunktioniert: [
      "Behind-the-Scenes auf der Baustelle",
      "Ehrliche Fehler-Stories mit Learnings",
    ],
    hatNichtFunktioniert: ["Zu polierte Studio-Optik", "Reine Produktwerbung"],
    naechsteHebel: [
      "1 Story pro Woche mit Kundenstimme (anonym)",
      "Speicher-CTA am Ende jeder Vertrauens-Story",
    ],
  },
  {
    bereich: "conversion",
    hatFunktioniert: [
      "Klares Angebot + Deadline im CTA",
      "DM-Keyword statt generischem Link",
    ],
    hatNichtFunktioniert: ["Weicher CTA ohne nächsten Schritt"],
    naechsteHebel: ["Conversion nur an Tag 27–30 bündeln", "Ein Angebot pro Monat"],
  },
];

export function buildDemoPerformance(zyklus: Zyklus): VideoWithInsights[] {
  return zyklus.plan.map((v, i) => ({
    id: v.id,
    title: v.title,
    bereich: v.bereich,
    platform: v.platform,
    postingDay: v.postingDay,
    format: v.format,
    metrics: {
      views: 1200 + i * 137,
      watchTimeSeconds: 900 + i * 20,
      completionRate: v.bereich === "reichweite" ? 0.42 : 0.31,
      shares: 12 + (i % 7),
      saves: v.bereich === "vertrauen" ? 45 + i : 10,
      follows: v.bereich === "vertrauen" ? 8 + (i % 5) : 2,
      profileVisits: 30 + i,
      comments: 5 + (i % 4),
      linkClicks: v.bereich === "conversion" ? 18 + i : 3,
      ctaRate: v.bereich === "conversion" ? 0.08 : 0.02,
      dms: v.bereich === "conversion" ? 4 : 0,
      bookings: v.bereich === "conversion" ? 2 : 0,
    },
  }));
}

const CAROUSEL_DEMO_PLATFORMS: Platform[] = [
  "instagram",
  "linkedin",
  "youtube",
  "tiktok",
];

/** Verteilt Videos auf die Karussell-Plattformen (Demo). */
export function assignCarouselPlatforms(
  items: VideoWithInsights[]
): VideoWithInsights[] {
  return items.map((v, i) => ({
    ...v,
    platform: CAROUSEL_DEMO_PLATFORMS[i % CAROUSEL_DEMO_PLATFORMS.length],
  }));
}

export const DEMO_DIFF = {
  headline: "Plan v2 setzt Loop-Learnings sichtbar um",
  bereichMixChange: "Mix v1 R60/V25/C15 → v2 R60/V25/C15 (mehr Tutorial in Reichweite)",
  bullets: [
    "10 Tage mit geändertem Hook",
    "4 Tage mit geändertem Format (mehr Tutorial)",
    "Tag 3: neuer Hook „[v2] Tutorial-Hook…“",
  ],
};

export const DETAILED_DAY_SET = DETAIL_DAYS;
