import { callClaudeJSON } from "@/lib/claude";
import type {
  ContentBriefing,
  ReferenzVideo,
  ResearchResult,
  VideoDetails,
  VideoIdea,
} from "@/lib/types";

const BEREICH_RULES: Record<string, string> = {
  reichweite:
    "Ziel: Reichweite. Hook muss in den ersten 2 Sekunden stoppen (Konflikt, Zahl, Fehler, Gegenthese). Am Ende eine offene Schleife oder Frage — KEIN Verkaufs-CTA.",
  vertrauen:
    "Ziel: Vertrauen. Im Body Substanz und Beweis: konkretes Vorgehen, echte Zahlen, Vorher/Nachher, eigene Erfahrung. Sanfter CTA (folgen, speichern, kommentieren).",
  conversion:
    "Ziel: Conversion. Klarer Nutzen und ein einziger nächster Schritt (Link, DM-Keyword, Termin). Kein zweiter Nebenwunsch.",
};

const FORMAT_HINTS: Record<string, string> = {
  talking_head:
    "Direkt in die Kamera gesprochen. Kurze Hauptsätze, Sprechrhythmus, keine Schachtelsätze.",
  tutorial:
    "Schritt für Schritt, nummeriert, jeder Schritt mit sichtbarem Ergebnis.",
  story:
    "Erzählbogen: Ausgangslage → Bruch → Wendepunkt → Ergebnis → Lehre.",
  b_roll:
    "Wenig Text, viel Bild. Voiceover-Sätze knapp, jeder Satz braucht ein zeigbares Bild.",
};

const SYSTEM = `Du bist Senior Short-Form-Video-Autor (Instagram Reels, TikTok, YouTube Shorts) und schreibst auf Deutsch.

Qualitätsregeln — verbindlich:
- Sprechsprache, nicht Schriftsprache. Kurze Hauptsätze, die man laut vorlesen kann.
- KEINE Platzhalter, keine eckigen Klammern, kein "hier könntest du". Alles ausformuliert.
- KEINE Marketing-Floskeln ("game changer", "revolutionär", "in der heutigen Zeit", "Willkommen zurück").
- Konkret statt allgemein: Zahlen, Beispiele, Namen, Beträge, Zeitangaben.
- Hook: max. 2 Sätze, funktioniert ohne Ton (wird als Text-Overlay gelesen).
- Body: 90–150 Wörter, das entspricht ca. 40–60 Sekunden gesprochen. Klare Struktur.
- CTA: ein Satz, eine Handlung.
- Grafik-Vorschlag: exaktes Text-Overlay (in Anführungszeichen) plus Thumbnail-Bildidee.
- Dreh-Anleitung: 4–7 Shots, jeder mit Setting, Einstellungsgröße, konkretem Inhalt und Dauer.`;

function briefingBlock(briefing?: ContentBriefing): string {
  if (!briefing) return "";
  const a = briefing.answers;
  return `CONTENT-BRIEFING (verbindlich einhalten):
- Nische: ${briefing.praezisierteNische || briefing.nische}
- Vision: ${briefing.contentVision ?? "—"}
- Zielgruppe im Detail: ${a?.zielgruppeDetail ?? "—"}
- Ziel der 30 Tage: ${a?.contentZiel30Tage ?? "—"}
- Format-Präferenz: ${a?.formatPraeferenz ?? "—"}
- NO-GOS (niemals verwenden): ${a?.noGos?.trim() || "keine"}
- Zeitbudget pro Woche: ${a?.zeitBudgetProWoche ?? "—"}`;
}

function researchBlock(research?: ResearchResult): string {
  if (!research) return "";
  return `RESEARCH:
- Zielgruppe: ${research.zielgruppe}
- Pain Points: ${research.painPoints?.join(" | ")}
- Bewährte Hook-Muster: ${research.hookMuster?.join(" | ")}
- Tonalität: ${research.tonality ?? "—"}`;
}

const SCHEMA = `{
  "skript": {
    "hook": "1-2 Sätze, stoppt den Scroll",
    "body": "90-150 Wörter, ausformuliert, Sprechsprache",
    "cta": "ein Satz, eine Handlung"
  },
  "grafikVorschlag": "Text-Overlay in Anführungszeichen + Thumbnail-Idee",
  "referenzVideoUrl": "URL aus der Liste oder leerer String",
  "referenzBegruendung": "was genau übernommen wird",
  "drehAnleitung": [
    { "setting": "", "einstellungsgroesse": "", "inhalt": "", "ungefaehreDauerSekunden": 0 }
  ]
}`;

type ScriptPayload = Pick<
  VideoDetails,
  | "skript"
  | "grafikVorschlag"
  | "referenzVideoUrl"
  | "referenzBegruendung"
  | "drehAnleitung"
>;

/**
 * Skript, Grafik, Referenz und Dreh-Anleitung in EINEM Call.
 * Zwei getrennte Calls waren doppelt so langsam und die Shot-List passte
 * regelmäßig nicht zum Skript.
 */
export async function generateVideoScript(
  videoIdea: VideoIdea,
  research?: ResearchResult,
  referenzen?: ReferenzVideo[],
  briefing?: ContentBriefing
): Promise<ScriptPayload> {
  const refs = (referenzen ?? []).slice(0, 6);

  const result = await callClaudeJSON<ScriptPayload>(
    `${SYSTEM}

${BEREICH_RULES[videoIdea.bereich] ?? ""}
Format ${videoIdea.format}: ${FORMAT_HINTS[videoIdea.format] ?? ""}`,
    `VIDEO (Tag ${videoIdea.postingDay}, Plattform ${videoIdea.platform}):
- Titel: ${videoIdea.title}
- Hook-Idee: ${videoIdea.hook}
- Warum dieses Video: ${videoIdea.begruendung}

${briefingBlock(briefing)}

${researchBlock(research)}

REFERENZVIDEOS (nur aus dieser Liste wählen, sonst leerer String):
${refs.length ? JSON.stringify(refs, null, 2) : "— keine —"}

Schreibe das fertige, drehbare Video. Der Body muss so ausformuliert sein, dass man ihn direkt ablesen kann.`,
    SCHEMA
  );

  return result;
}

/** @deprecated Nutze generateVideoScript — liefert zusätzlich die Dreh-Anleitung. */
export async function generateScriptAndGrafik(
  videoIdea: VideoIdea,
  research?: ResearchResult,
  referenzen?: ReferenzVideo[],
  briefing?: ContentBriefing
): Promise<Omit<ScriptPayload, "drehAnleitung">> {
  const { drehAnleitung: _drehAnleitung, ...rest } = await generateVideoScript(
    videoIdea,
    research,
    referenzen,
    briefing
  );
  return rest;
}
