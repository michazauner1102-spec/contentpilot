import type { ResearchResult, VideoDetails, VideoIdea } from "@/lib/types";
import { BEREICH_LABELS } from "@/lib/types";

const MOCK_CTA: Record<string, string> = {
  reichweite: "Folgen, wenn du Teil 2 morgen sehen willst — sonst verpasst du den Rest.",
  vertrauen: "Speichern und beim nächsten Dreh wieder hereinschauen.",
  conversion: "Schreib „ANFRAGE“ in die Kommentare — ich schick dir den Ablauf per DM.",
};

const FORMAT_BILD: Record<string, string> = {
  talking_head: "Gesicht groß links, fetter Text-Overlay rechts, Untertitel unten.",
  tutorial: "Split-Screen: Schritt 1 / Schritt 2, Nummern in Kreisen, Pfeile zwischen Frames.",
  story: "Authentisches BTS-Foto, warmes Licht, wenig Text — max. 5 Wörter Overlay.",
  b_roll: "Schnelle Schnitte (0,8 s), Detail-Hände/Werkzeug, Text nur als Stichworte.",
};

/** Vollständiges Skript + Bildvorschläge für Demo und API-Fallback. */
export function buildDemoVideoScript(
  idea: VideoIdea,
  research?: ResearchResult
): Pick<
  VideoDetails,
  "skript" | "grafikVorschlag" | "referenzVideoUrl" | "referenzBegruendung" | "drehAnleitung"
> {
  const pain = research?.painPoints?.[0] ?? "typische Hürden in deiner Nische";
  const hook =
    idea.hook?.trim() ||
    `Stop — Tag ${idea.postingDay}: Das musst du zu „${idea.title}“ wissen.`;

  const bodyByBereich: Record<string, string> = {
    reichweite: `**Inhalt (15–25 s):** Kurz ${pain} benennen — viele kennen das. Dann ein konkretes Mini-Beispiel aus dem Handwerksalltag (Problem → 2 Schritte Lösung). Kein Fachchinesisch. Abschluss mit Teaser: „In den nächsten Sekunden zeige ich dir …“`,
    vertrauen: `**Inhalt (20–35 s):** Ehrlicher Ablauf: Was du wirklich machst, was schiefgehen kann, was du daraus gelernt hast. Eine Zahl oder Kundenstimme (anonym). Zuschauer sollen denken: „Dem kann ich vertrauen.“`,
    conversion: `**Inhalt (20–30 s):** Ein klares Angebot — für wen, welches Ergebnis, bis wann. Social Proof in einem Satz. Keine Ablenkung, ein Handlungsweg.`,
  };

  const body =
    bodyByBereich[idea.bereich] ??
    `**Inhalt:** Beispiel zu ${pain}, Lösung in 2 Schritten, kurzer Beweis.`;

  const cta = MOCK_CTA[idea.bereich] ?? "Folgen für den nächsten Teil.";

  const grafikVorschlag = [
    `**Thumbnail / Cover:** ${idea.title} — Gesicht + Kontrastfarbe passend zu ${BEREICH_LABELS[idea.bereich]}.`,
    `**Text-Overlay im Video:** ${FORMAT_BILD[idea.format] ?? FORMAT_BILD.talking_head}`,
    `**B-Roll-Ideen:** Hände am Werkzeug, Vorher/Nachher, Bildschirm-Recording (falls Tutorial), 9:16 safe zone beachten.`,
    `**Untertitel:** Hook-Worte in den ersten 2 Sekunden als Text mit hervorheben.`,
  ].join("\n");

  return {
    skript: { hook, body, cta },
    grafikVorschlag,
    referenzVideoUrl: "",
    referenzBegruendung: `Format „${idea.format}“ für ${BEREICH_LABELS[idea.bereich]} an Tag ${idea.postingDay} — Hook und CTA passen zum Mix.`,
    drehAnleitung: [
      {
        setting: "Hauptset, weiches Seitenlicht",
        einstellungsgroesse: "Halbnah",
        inhalt: "Hook wortwörtlich — Blick in die Kamera",
        ungefaehreDauerSekunden: 4,
      },
      {
        setting: "Gleiches Set",
        einstellungsgroesse: "Medium",
        inhalt: "Inhalt / Story — Problem und Lösung",
        ungefaehreDauerSekunden: 18,
      },
      {
        setting: "B-Roll Detail",
        einstellungsgroesse: "Nah",
        inhalt: "Beweis: Ergebnis, Werkzeug, Screen",
        ungefaehreDauerSekunden: 10,
      },
      {
        setting: "Zurück Halbnah",
        einstellungsgroesse: "Halbnah",
        inhalt: "CTA langsam und deutlich",
        ungefaehreDauerSekunden: 5,
      },
    ],
  };
}

export function mergeDemoVideoDetails(
  video: VideoDetails,
  research?: ResearchResult
): VideoDetails {
  const extra = buildDemoVideoScript(video, research);
  const hasScript = Boolean(video.skript?.hook?.trim());
  return {
    ...video,
    skript: hasScript ? video.skript : extra.skript,
    grafikVorschlag: video.grafikVorschlag?.trim()
      ? video.grafikVorschlag
      : extra.grafikVorschlag,
    referenzVideoUrl: video.referenzVideoUrl || extra.referenzVideoUrl,
    referenzBegruendung: video.referenzBegruendung?.trim()
      ? video.referenzBegruendung
      : extra.referenzBegruendung,
    drehAnleitung:
      video.drehAnleitung?.length > 0
        ? video.drehAnleitung
        : extra.drehAnleitung,
  };
}
