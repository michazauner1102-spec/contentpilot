import { BEREICH_LABELS } from "@/lib/types";
import type { MonthlyFeedbackDocument } from "@/lib/types";

const PRIORITAET_LABEL = {
  hoch: "Hoch",
  mittel: "Mittel",
  niedrig: "Niedrig",
} as const;

export function buildMonthlyFeedbackMarkdown(doc: MonthlyFeedbackDocument): string {
  const lines: string[] = [];

  lines.push(`# Monats-Feedback — ${doc.monat}`);
  lines.push("");
  lines.push(`**Nische:** ${doc.nische}`);
  lines.push(`**Erstellt:** ${doc.erstelltAm}`);
  if (doc.mock) {
    lines.push("");
    lines.push("_Demo-Daten (ohne Live-LLM)_");
  }
  lines.push("");
  lines.push("## Kurzfassung");
  lines.push("");
  lines.push(doc.executiveSummary);
  lines.push("");

  lines.push("## Trends im Monat");
  lines.push("");
  for (const t of doc.trends) lines.push(`- ${t}`);
  lines.push("");

  lines.push("## Was gut lief");
  lines.push("");
  for (const x of doc.wasGut) lines.push(`- ${x}`);
  lines.push("");

  lines.push("## Was nicht lief");
  lines.push("");
  for (const x of doc.wasSchlecht) lines.push(`- ${x}`);
  lines.push("");

  lines.push("## Konkrete Vorschläge für den nächsten Monat");
  lines.push("");
  for (const v of doc.konkreteVorschlaege) {
    lines.push(
      `### ${v.titel} _(Priorität: ${PRIORITAET_LABEL[v.prioritaet]})_`
    );
    lines.push("");
    lines.push(v.beschreibung);
    lines.push("");
  }

  const ka = doc.kommentarAnalyse;
  lines.push("## Kommentar-Analyse");
  lines.push("");
  lines.push(
    `Insgesamt **${ka.gesamtKommentare}** Kommentare ausgewertet, davon **${ka.sinnvolleAnzahl}** mit actionable Inhalt.`
  );
  lines.push("");

  if (ka.themenAusKommentaren.length) {
    lines.push("### Wiederkehrende Themen");
    lines.push("");
    for (const t of ka.themenAusKommentaren) lines.push(`- ${t}`);
    lines.push("");
  }

  if (ka.highlights.length) {
    lines.push("### Ausgewählte Kommentare (mit Einordnung)");
    lines.push("");
    for (const c of ka.highlights) {
      const tag = c.sinnvoll ? "✓ sinnvoll" : "○ wenig relevant";
      lines.push(
        `- **Tag ${c.postingDay} · ${c.platform}** (${c.kategorie}, ${tag}): „${c.text}"`
      );
      lines.push(`  - ${c.zusammenfassung}`);
      if (c.handlungsempfehlung) {
        lines.push(`  - _Empfehlung:_ ${c.handlungsempfehlung}`);
      }
    }
    lines.push("");
  }

  if (ka.zuIgnorieren.length) {
    lines.push("### Kannst du ignorieren");
    lines.push("");
    for (const z of ka.zuIgnorieren) lines.push(`- ${z}`);
    lines.push("");
  }

  if (doc.learningsByBereich?.length) {
    lines.push("## Learnings je Bereich");
    lines.push("");
    for (const l of doc.learningsByBereich) {
      lines.push(`### ${BEREICH_LABELS[l.bereich]}`);
      lines.push("");
      lines.push("**Funktioniert:**");
      for (const x of l.hatFunktioniert) lines.push(`- ${x}`);
      lines.push("");
      lines.push("**Nicht funktioniert:**");
      for (const x of l.hatNichtFunktioniert) lines.push(`- ${x}`);
      lines.push("");
      lines.push("**Nächste Hebel:**");
      for (const x of l.naechsteHebel) lines.push(`- ${x}`);
      lines.push("");
    }
  }

  lines.push("---");
  lines.push("_ContentPilot Monats-Feedback_");
  return lines.join("\n");
}

export function monthlyFeedbackFilename(
  nische: string,
  monat: string
): string {
  const slug = nische
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 36);
  return `contentpilot-feedback-${slug}-${monat}.md`;
}
