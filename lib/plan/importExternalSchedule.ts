import type {
  Bereich,
  Platform,
  VideoDetails,
  VideoFormat,
  VideoIdea,
} from "@/lib/types";
import { ideasToPlan } from "@/lib/types";

export type ScheduleImportSource =
  | "buffer"
  | "hootsuite"
  | "contentpilot"
  | "generic"
  | "unknown";

export interface ImportScheduleResult {
  plan: VideoDetails[];
  bereichMix: Record<Bereich, number>;
  monat?: string;
  source: ScheduleImportSource;
  warnings: string[];
  importedCount: number;
}

const FORMATS: VideoFormat[] = ["talking_head", "tutorial", "story", "b_roll"];

function computeMixFromIdeas(ideas: VideoIdea[]): Record<Bereich, number> {
  const counts: Record<Bereich, number> = {
    reichweite: 0,
    vertrauen: 0,
    conversion: 0,
  };
  for (const idea of ideas) counts[idea.bereich]++;
  const total = ideas.length || 1;
  return {
    reichweite: counts.reichweite / total,
    vertrauen: counts.vertrauen / total,
    conversion: counts.conversion / total,
  };
}

function normalizePlatform(raw: string | undefined): Platform {
  const t = (raw ?? "").toLowerCase();
  if (t.includes("youtube") || t.includes("short")) return "youtube";
  if (t.includes("tiktok")) return "tiktok";
  if (t.includes("linkedin")) return "linkedin";
  if (t.includes("insta") || t.includes("reels")) return "instagram";
  return "instagram";
}

function normalizeBereich(raw: string | undefined, text: string): Bereich {
  if (raw === "reichweite" || raw === "vertrauen" || raw === "conversion") {
    return raw;
  }
  const t = `${raw ?? ""} ${text}`.toLowerCase();
  if (t.includes("conversion") || t.includes("cta") || t.includes("lead")) {
    return "conversion";
  }
  if (t.includes("vertrauen") || t.includes("story")) return "vertrauen";
  return "reichweite";
}

function normalizeFormat(raw: string | undefined, text: string): VideoFormat {
  if (raw && FORMATS.includes(raw as VideoFormat)) return raw as VideoFormat;
  const t = `${raw ?? ""} ${text}`.toLowerCase();
  if (t.includes("tutorial") || t.includes("how")) return "tutorial";
  if (t.includes("story") || t.includes("pov")) return "story";
  if (t.includes("b-roll") || t.includes("broll")) return "b_roll";
  return "talking_head";
}

function firstLine(text: string, max = 120): string {
  const line = text.split(/\r?\n/)[0]?.trim() ?? text.trim();
  return line.length <= max ? line : `${line.slice(0, max - 1)}…`;
}

function hookFromText(text: string): string {
  const line = firstLine(text, 90);
  return line.length > 60 ? `${line.slice(0, 57)}…` : line;
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
      row.push(cell);
      cell = "";
      if (row.some((c) => c.trim())) rows.push(row);
      row = [];
      if (ch === "\r") i++;
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  row.push(cell);
  if (row.some((c) => c.trim())) rows.push(row);
  return rows;
}

function headerIndex(headers: string[], ...needles: string[]): number {
  const lower = headers.map((h) => h.toLowerCase().trim());
  for (const needle of needles) {
    const idx = lower.findIndex(
      (h) => h === needle || h.includes(needle)
    );
    if (idx >= 0) return idx;
  }
  return -1;
}

function parseDateToDay(value: string, refMonth?: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const dayOnly = /^(\d{1,2})$/.exec(trimmed);
  if (dayOnly) {
    const d = Number(dayOnly[1]);
    return d >= 1 && d <= 30 ? d : null;
  }

  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) {
    const dt = new Date(parsed);
    if (refMonth && trimmed.length >= 7) {
      const ym = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
      if (ym !== refMonth.slice(0, 7)) return null;
    }
    const d = dt.getDate();
    return d >= 1 && d <= 30 ? d : null;
  }

  const de = /^(\d{1,2})\.(\d{1,2})(?:\.(\d{2,4}))?/.exec(trimmed);
  if (de) {
    const d = Number(de[1]);
    return d >= 1 && d <= 30 ? d : null;
  }

  return null;
}

function detectCsvSource(headers: string[]): ScheduleImportSource {
  const h = headers.join(" ").toLowerCase();
  if (h.includes("scheduled at") && h.includes("text")) return "buffer";
  if (h.includes("social network") && h.includes("message")) return "hootsuite";
  if (h.includes("postingday") || h.includes("bereich")) return "generic";
  return "unknown";
}

interface DraftRow {
  text: string;
  postingDay: number | null;
  platform?: string;
  bereich?: string;
  format?: string;
  title?: string;
}

function parseCsvSchedule(
  text: string,
  refMonth?: string
): { drafts: DraftRow[]; source: ScheduleImportSource; warnings: string[] } {
  const warnings: string[] = [];
  const rows = parseCsvRows(text.trim());
  if (rows.length < 2) {
    return { drafts: [], source: "unknown", warnings: ["CSV enthält keine Datenzeilen."] };
  }

  const headers = rows[0];
  const source = detectCsvSource(headers);

  const idxText = headerIndex(
    headers,
    "text",
    "message",
    "content",
    "caption",
    "post text"
  );
  const idxTitle = headerIndex(headers, "title", "titel", "name");
  const idxDay = headerIndex(headers, "postingday", "day", "tag");
  const idxDate = headerIndex(
    headers,
    "scheduled at",
    "scheduled date",
    "date",
    "scheduled",
    "posted at"
  );
  const idxTime = headerIndex(headers, "time", "scheduled time");
  const idxPlatform = headerIndex(
    headers,
    "channel",
    "social network",
    "platform",
    "profile",
    "network"
  );
  const idxBereich = headerIndex(headers, "bereich", "pillar", "goal");
  const idxFormat = headerIndex(headers, "format", "type");

  if (idxText < 0 && idxTitle < 0) {
    return {
      drafts: [],
      source,
      warnings: [
        "Keine Spalte für Text gefunden (erwartet z. B. Text, Message, Title).",
      ],
    };
  }

  const drafts: DraftRow[] = [];

  for (let r = 1; r < rows.length; r++) {
    const cols = rows[r];
    if (!cols.some((c) => c.trim())) continue;

    const textCol =
      idxText >= 0 ? cols[idxText]?.trim() : cols[idxTitle]?.trim() ?? "";
    const titleCol = idxTitle >= 0 ? cols[idxTitle]?.trim() : "";
    const body = textCol || titleCol;
    if (!body) continue;

    let postingDay: number | null = null;
    if (idxDay >= 0) {
      postingDay = parseDateToDay(cols[idxDay] ?? "", refMonth);
    }
    if (postingDay == null && idxDate >= 0) {
      const datePart = cols[idxDate] ?? "";
      const timePart = idxTime >= 0 ? cols[idxTime] : "";
      postingDay = parseDateToDay(
        `${datePart} ${timePart}`.trim(),
        refMonth
      );
    }

    drafts.push({
      text: body,
      title: titleCol && titleCol !== body ? titleCol : undefined,
      postingDay,
      platform: idxPlatform >= 0 ? cols[idxPlatform] : undefined,
      bereich: idxBereich >= 0 ? cols[idxBereich] : undefined,
      format: idxFormat >= 0 ? cols[idxFormat] : undefined,
    });
  }

  if (source === "buffer") {
    warnings.push("Buffer-CSV erkannt — geplante Posts werden auf Kalendertage gemappt.");
  } else if (source === "hootsuite") {
    warnings.push("Hootsuite-CSV erkannt — Messages werden als Video-Themen übernommen.");
  }

  return { drafts, source, warnings };
}

function assignPostingDays(
  drafts: DraftRow[],
  warnings: string[]
): DraftRow[] {
  const used = new Set<number>();
  let autoDay = 1;

  return drafts.map((d, i) => {
    if (d.postingDay != null && d.postingDay >= 1 && d.postingDay <= 30) {
      if (used.has(d.postingDay)) {
        warnings.push(
          `Tag ${d.postingDay} doppelt — Eintrag ${i + 1} auf nächsten freien Tag gelegt.`
        );
      } else {
        used.add(d.postingDay);
        return d;
      }
    }

    while (autoDay <= 30 && used.has(autoDay)) autoDay++;
    if (autoDay > 30) {
      warnings.push(`Eintrag ${i + 1} übersprungen — alle 30 Tage belegt.`);
      return { ...d, postingDay: null };
    }
    used.add(autoDay);
    const next = { ...d, postingDay: autoDay };
    autoDay++;
    return next;
  });
}

function draftsToIdeas(drafts: DraftRow[], warnings: string[]): VideoIdea[] {
  const assigned = assignPostingDays(drafts, warnings);
  const ideas: VideoIdea[] = [];

  assigned.forEach((d, i) => {
    if (d.postingDay == null) return;
    const title = d.title ?? firstLine(d.text);
    ideas.push({
      id: `import-${d.postingDay}-${i}-${Date.now().toString(36)}`,
      title,
      hook: hookFromText(d.text),
      bereich: normalizeBereich(d.bereich, d.text),
      format: normalizeFormat(d.format, d.text),
      platform: normalizePlatform(d.platform),
      postingDay: d.postingDay,
      begruendung: `Importierter Post (Tag ${d.postingDay}) — aus Scheduling-Tool übernommen.`,
    });
  });

  return ideas;
}

function parseJsonSchedule(
  text: string
): {
  ideas: VideoIdea[];
  source: ScheduleImportSource;
  monat?: string;
  warnings: string[];
} {
  const warnings: string[] = [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return {
      ideas: [],
      source: "unknown",
      warnings: ["JSON ist ungültig."],
    };
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.zyklus && typeof obj.zyklus === "object") {
    const z = obj.zyklus as { plan?: VideoDetails[]; monat?: string };
    if (z.plan?.length) {
      return {
        ideas: z.plan.map((v) => ({
          id: v.id,
          title: v.title,
          hook: v.hook,
          bereich: v.bereich,
          format: v.format,
          platform: v.platform,
          postingDay: v.postingDay,
          begruendung: v.begruendung,
        })),
        source: "contentpilot",
        monat: z.monat,
        warnings: ["ContentPilot-Backup/Export erkannt."],
      };
    }
  }

  const posts = Array.isArray(parsed)
    ? parsed
    : Array.isArray(obj.posts)
      ? obj.posts
      : Array.isArray(obj.schedule)
        ? obj.schedule
        : null;

  if (!posts?.length) {
    return {
      ideas: [],
      source: "unknown",
      warnings: ["JSON: Array, posts[] oder zyklus.plan erwartet."],
    };
  }

  const drafts: DraftRow[] = posts.map((p) => {
    const row = p as Record<string, unknown>;
    const textVal =
      String(row.text ?? row.message ?? row.caption ?? row.body ?? "") ||
      String(row.title ?? "");
    return {
      text: textVal,
      title: row.title ? String(row.title) : undefined,
      postingDay:
        typeof row.postingDay === "number"
          ? row.postingDay
          : typeof row.day === "number"
            ? row.day
            : parseDateToDay(String(row.scheduledAt ?? row.date ?? "")),
      platform: row.platform ? String(row.platform) : String(row.channel ?? ""),
      bereich: row.bereich ? String(row.bereich) : undefined,
      format: row.format ? String(row.format) : undefined,
    };
  });

  return {
    ideas: draftsToIdeas(drafts, warnings),
    source: "generic",
    monat: typeof obj.monat === "string" ? obj.monat : undefined,
    warnings,
  };
}

export function importExternalSchedule(
  raw: string,
  options?: { refMonth?: string; fileName?: string }
): ImportScheduleResult {
  const trimmed = raw.trim();
  const warnings: string[] = [];
  const refMonth = options?.refMonth ?? new Date().toISOString().slice(0, 7);

  if (!trimmed) {
    return {
      plan: [],
      bereichMix: { reichweite: 0.6, vertrauen: 0.25, conversion: 0.15 },
      source: "unknown",
      warnings: ["Keine Daten zum Importieren."],
      importedCount: 0,
    };
  }

  const looksJson =
    trimmed.startsWith("{") ||
    trimmed.startsWith("[") ||
    options?.fileName?.toLowerCase().endsWith(".json");

  if (looksJson) {
    const { ideas, source, monat, warnings: w } = parseJsonSchedule(trimmed);
    warnings.push(...w);
    const plan = ideasToPlan(ideas);
    return {
      plan,
      bereichMix: computeMixFromIdeas(ideas),
      monat,
      source,
      warnings,
      importedCount: plan.length,
    };
  }

  const { drafts, source, warnings: w } = parseCsvSchedule(trimmed, refMonth);
  warnings.push(...w);
  const ideas = draftsToIdeas(drafts, warnings);
  const plan = ideasToPlan(ideas);

  return {
    plan,
    bereichMix: computeMixFromIdeas(ideas),
    monat: refMonth,
    source,
    warnings,
    importedCount: plan.length,
  };
}

export const SAMPLE_BUFFER_CSV = `Text,Tags,Image,Link,Posting Time,Scheduled At,Channel
"3 Fehler bei der Angebotserstellung — Hook mit Zahl",reels,,,12:00,2026-08-03 12:00,Instagram
"POV: Kunde fragt nach dem Preis",story,,,18:30,2026-08-07 18:30,Instagram
"Kommentiert FAQ — wir drehen Teil 2",cta,,,10:00,2026-08-15 10:00,Instagram
`;

export const SAMPLE_HOOTSUITE_CSV = `Date,Time,Message,Social Network Profiles
2026-08-01,09:00,"Tutorial: Erstes Video in 15 Minuten drehen",Instagram
2026-08-08,17:00,"Behind the Scenes — ehrlicher Arbeitstag",Instagram
2026-08-22,11:30,"DM keyword ANFRAGE — so buchst du",Instagram
`;
