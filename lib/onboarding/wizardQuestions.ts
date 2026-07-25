import type { WizardQuestion } from "@/lib/types";

export const WIZARD_QUESTIONS: WizardQuestion[] = [
  {
    id: "zielgruppeDetail",
    label: "1. Wer ist deine Zielgruppe — so konkret wie möglich?",
    placeholder: "Oder eigene Zielgruppe beschreiben …",
    hint: "Je genauer, desto passender werden Hooks und Themen. Du kannst eine Vorlage wählen und anpassen.",
    selectOptions: [
      {
        value: "Lokale KMU & Selbstständige (DACH), 30–50, wenig Social-Media-Erfahrung",
        label: "Lokale Selbstständige / KMU",
        detail: "Handwerk, Beratung, Agentur vor Ort",
      },
      {
        value: "B2B-Entscheider (Marketing/GF), 28–45, LinkedIn + YouTube",
        label: "B2B Entscheider",
      },
      {
        value:
          "Privatpersonen mit Interesse an deiner Nische (keine Unternehmen), 18–45, Einsteiger & Enthusiasten, Instagram + TikTok + YouTube Shorts",
        label: "Interessierte an deiner Nische",
        detail: "Menschen & Community — nicht B2B/KMU",
      },
      {
        value: "Creator & Coaches am Start, 22–35, Instagram + TikTok",
        label: "Aufbau Personal Brand",
      },
      {
        value: "Tech-/KI-Interessierte Unternehmer, 25–40, YouTube Shorts + LinkedIn",
        label: "Tech / KI / Agentur-Umfeld",
      },
      {
        value: "Agentur-Inhaber & Berater (Personal Branding, Leadgen), 30–50, LinkedIn-first",
        label: "Agenturen & Berater",
      },
      {
        value: "HR / Recruiting / Employer Branding, 28–45, authentische Mitarbeiter-Stories",
        label: "HR & Employer Branding",
      },
      {
        value: "E-Commerce & D2C Brands, 25–40, UGC-Style + Produkt-Tutorials",
        label: "E-Commerce / D2C",
      },
      {
        value: "Healthcare / Wellness-Profis, 30–55, vertrauensorientiert, deutsche Tonalität",
        label: "Gesundheit & Wellness",
      },
      {
        value: "Immobilien / Finanzberater, 35–55, lokale Expertise + Conversion-Fokus",
        label: "Immobilien & Finanzen",
      },
    ],
    allowCustom: true,
  },
  {
    id: "contentZiel30Tage",
    label: "2. Was soll dein Content in 30 Tagen bewirken?",
    placeholder: "Eigenes Ziel formulieren …",
    hint: "Ein klares 30-Tage-Ziel hilft beim Mix aus Reichweite, Vertrauen und Conversion.",
    selectOptions: [
      {
        value: "Mehr Sichtbarkeit & Reichweite — neue Menschen erreichen",
        label: "Reichweite aufbauen",
      },
      {
        value: "Vertrauen & Expertise zeigen — speichern, folgen, wiedererkennbar werden",
        label: "Vertrauen aufbauen",
      },
      {
        value: "5–15 qualifizierte Anfragen / Leads über Content",
        label: "Anfragen & Leads",
      },
      {
        value: "Community wachsen + erste Kooperationen/Partnerschaften",
        label: "Community & Kooperationen",
      },
      {
        value: "Mix: Reichweite in Woche 1–2, Vertrauen Woche 3, Conversion Woche 4",
        label: "Ausgewogener 30-Tage-Mix (empfohlen)",
      },
    ],
    allowCustom: true,
  },
  {
    id: "formatPraeferenz",
    label: "3. Welche Formate kannst du dir vorstellen?",
    placeholder: "Weitere Formate oder Einschränkungen …",
    hint: "Wähle alles, was für dich realistisch ist. Unsicher? Starte mit Talking Head + Tutorial.",
    chipOptions: [
      "Talking Head (du sprichst in die Kamera)",
      "Tutorial / How-to (Schritt für Schritt)",
      "Story / Behind the Scenes",
      "B-Roll (Stimmungsbilder + Text/Sprache)",
      "Interview / Gespräch",
      "Screen Recording (Bildschirm)",
    ],
    allowCustom: true,
  },
  {
    id: "noGos",
    label: "4. Was willst du auf keinen Fall machen (No-Gos)?",
    placeholder: "Weitere No-Gos …",
    hint: "Damit der Plan zu dir passt — wähle alles, was absolut nicht zu dir passt.",
    chipOptions: [
      "Tanz-Trends / Lip-Sync",
      "Aggressiver Hard-Selling-Content",
      "Politisch polarisierende Themen",
      "Zu privat / Familie im Bild",
      "Hoher Schnitt-Aufwand / komplexe Effekte",
      "Englisch, wenn du nur Deutsch willst",
      "Humor / Ironie, die missverstanden werden könnte",
    ],
    allowCustom: true,
  },
  {
    id: "zeitBudgetProWoche",
    label: "5. Wie viel Zeit hast du pro Woche für Content?",
    placeholder: "Eigene Angabe …",
    hint: "Realistisches Budget = Plan, den du auch umsetzen kannst.",
    selectOptions: [
      {
        value: "1–2 Stunden: nur schnelle Reels, minimaler Schnitt",
        label: "1–2 Std. / Woche (Minimal)",
      },
      {
        value: "3–4 Stunden: 1 Drehtag + einfacher Schnitt",
        label: "3–4 Std. / Woche (Standard)",
      },
      {
        value: "5–8 Stunden: Batch-Dreh + mehrere Plattformen",
        label: "5–8 Std. / Woche (Ambitioniert)",
      },
      {
        value: "Outsource Schnitt — ich filme nur 2h/Woche",
        label: "Filmen ja, Schnitt extern",
      },
    ],
    allowCustom: true,
  },
];

export type WizardAnswerKey = keyof import("@/lib/types").WizardAnswers;

/** Chips in Antwort-String mergen (kommagetrennt, ohne Duplikate) */
export function toggleChipInAnswer(current: string, chip: string): string {
  const parts = current
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const has = parts.some((p) => p.toLowerCase() === chip.toLowerCase());
  const next = has
    ? parts.filter((p) => p.toLowerCase() !== chip.toLowerCase())
    : [...parts, chip];
  return next.join(", ");
}

export function isChipSelected(answer: string, chip: string): boolean {
  return answer
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .includes(chip.toLowerCase());
}

export function hasWizardAnswer(value: string): boolean {
  return value.trim().length > 0;
}