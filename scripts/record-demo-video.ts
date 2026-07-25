/**
 * Plattform-Demo: Schritt-für-Schritt nach Nutzerintention, langsame Übergänge & Eingaben.
 * Voraussetzung: npm run dev (127.0.0.1:3000)
 * PLAYWRIGHT_BROWSERS_PATH=0 npm run demo:video
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import {
  buildDemoPerformance,
  buildDemoZyklus,
  DEMO_LEARNINGS,
  DEMO_NISCHE,
  DEMO_RESEARCH,
} from "../lib/demo/mockData";
import { computePlanDiff } from "../lib/planDiff";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.join(__dirname, "../demo/video");
const baseUrl = "http://127.0.0.1:3000";
const STORAGE_KEY = "contentpilot.flow.v1";

/** Max. Länge (Inhalt wird darauf getrimmt — kein langes Auffüllen). */
const TARGET_SECONDS = Number(process.env.DEMO_VIDEO_MAX_SEC ?? "130");

const VIEWPORT = { width: 1920, height: 1080 };
const DEVICE_SCALE = Number(process.env.DEMO_VIDEO_SCALE ?? "2");

/** Langsam, aber innerhalb ~2 Min Gesamtlauf. */
const P = {
  afterScene: 2600,
  afterNav: 2400,
  afterClick: 1400,
  afterType: 1800,
  readBlock: 3200,
  scrollStep: 750,
  typeDelayMs: 78,
};

const answers = {
  zielgruppeDetail:
    "Selbstständige Handwerker in Stuttgart — regional, wenig Zeit für Content",
  contentZiel30Tage: "30 Tage sichtbar werden und 5 qualifizierte Anfragen",
  formatPraeferenz: "Talking Head und kurze Tutorials unter 60 Sekunden",
  noGos: "Kein Hard-Selling, keine reinen Stock-Videos",
  zeitBudgetProWoche: "3 bis 4 Stunden pro Woche",
};

const sampleBrainstorm = [
  {
    id: "demo-b1",
    pillar: "attention" as const,
    title: "3 Fehler bei Reels",
    hook: "Stop — bevor du das nächste Reel drehst …",
    superhook: "POV: Du postest und niemand reagiert",
    format: "talking_head" as const,
    status: "idea" as const,
  },
  {
    id: "demo-b2",
    pillar: "value" as const,
    title: "Anfrage in 7 Tagen",
    hook: "So bekommst du deine erste Anfrage …",
    superhook: "Tutorial in unter 60 Sekunden",
    format: "tutorial" as const,
    status: "shortlist" as const,
  },
];

function baseSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    phase: "done",
    menu: "calendar",
    nische: DEMO_NISCHE,
    referentCreator: "Max Handwerk (Referenz-Creator)",
    answers,
    creatorSuggestion: {
      creatorName: "Max Handwerk",
      warumRelevant: "Bodenständige Hooks, starke Reichweite in der Nische.",
      uebernehmbareElemente: ["Pattern-Interrupt", "B-Roll"],
      formate: ["talking_head", "tutorial"],
      hookBeispiele: DEMO_RESEARCH.hookMuster,
      referenzVideos: [],
    },
    briefing: {
      nische: DEMO_NISCHE,
      referentCreator: "Max Handwerk",
      answers,
      praezisierteNische: DEMO_NISCHE,
      contentVision:
        "30 Tage Content-Loop: Reichweite aufbauen, Vertrauen, dann Conversion.",
      tonality: DEMO_RESEARCH.tonality,
    },
    research: DEMO_RESEARCH,
    researchCycle: 1,
    researchThemen: [],
    brainstormIdeas: sampleBrainstorm,
    productionGuide: null,
    progressLog: [],
    recordedIds: [],
    learnings: null,
    planDiff: null,
    planVersion: 1,
    performance: [] as unknown[],
    ...overrides,
  };
}

async function inject(
  page: import("playwright").Page,
  snapshot: Record<string, unknown>
) {
  await page.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data: snapshot }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(P.afterScene);
}

async function hold(page: import("playwright").Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function slowType(
  page: import("playwright").Page,
  locator: import("playwright").Locator,
  text: string
) {
  await locator.click();
  await hold(page, P.afterClick);
  await locator.fill("");
  await locator.pressSequentially(text, { delay: P.typeDelayMs });
  await hold(page, P.afterType);
}

async function slowScroll(page: import("playwright").Page, deltaY: number) {
  const steps = Math.max(3, Math.round(Math.abs(deltaY) / 120));
  const step = deltaY / steps;
  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, step);
    await hold(page, P.scrollStep);
  }
}

async function navTo(page: import("playwright").Page, label: RegExp) {
  await hold(page, P.afterClick);
  await page.getByRole("button", { name: label }).first().click();
  await hold(page, P.afterNav);
}

async function wizardNext(page: import("playwright").Page) {
  await hold(page, P.readBlock);
  const next = page.getByRole("button", { name: /Nächste Frage/i });
  if (await next.isVisible()) {
    await next.click();
    await hold(page, P.afterScene);
  }
}

async function main() {
  fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: DEVICE_SCALE,
    recordVideo: {
      dir: videoDir,
      size: { width: VIEWPORT.width, height: VIEWPORT.height },
    },
  });

  const page = await context.newPage();
  const t0 = Date.now();
  const v1 = buildDemoZyklus(1);
  const v2 = buildDemoZyklus(2);
  const diff = computePlanDiff(v1.plan, v2.plan);
  const perf = buildDemoPerformance(v1);

  // ═══ Schritt 1: Einstieg & Plan-Setup (Nische) ═══
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await hold(page, P.afterScene);
  await page.getByRole("button", { name: /Plan-Setup starten/i }).click();
  await hold(page, P.afterScene);
  await slowType(page, page.locator("#setup-nische"), DEMO_NISCHE);
  await slowType(
    page,
    page.locator("#setup-referent"),
    "Max Handwerk — Referenz-Creator"
  );
  await hold(page, P.readBlock);
  await page.getByRole("button", { name: /Weiter — 5 kurze Fragen/i }).click();
  await hold(page, P.afterScene);

  // ═══ Schritt 2: Fünf Fragen (Wizard) — sichtbar ausfüllen ═══
  const select = page.locator("select").first();
  if (await select.isVisible()) {
    await select.selectOption({ label: "Lokale Selbstständige / KMU" });
    await hold(page, P.afterType);
  }
  await slowType(page, page.locator("textarea").first(), answers.zielgruppeDetail);
  await wizardNext(page);

  if (await select.isVisible()) {
    await select.selectOption({ label: "Anfragen & Leads" }).catch(() => {});
    await hold(page, P.afterType);
  }
  await slowType(page, page.locator("textarea").first(), answers.contentZiel30Tage);
  await hold(page, P.readBlock);

  // Rest der Antworten im State — Fokus Video: Setup + 2 Fragen sichtbar, dann Research
  await inject(
    page,
    baseSnapshot({
      phase: "research",
      menu: "hitl",
      zyklus: null,
      research: {
        ...DEMO_RESEARCH,
        researchNotizen:
          "Pain Points und Hook-Muster für Handwerker — freigegeben für den Plan.",
      },
    })
  );

  // ═══ Schritt 3: Human in the Loop — Brainstorm & Research ═══
  await navTo(page, /Human in the Loop/i);
  await hold(page, P.readBlock);
  await slowScroll(page, 320);
  await hold(page, P.readBlock);
  await slowScroll(page, 380);
  await hold(page, P.readBlock);

  // ═══ Schritt 4: 30-Tage-Kalender — Tag & Skript ═══
  await inject(
    page,
    baseSnapshot({
      zyklus: v1,
      menu: "calendar",
      planVersion: 1,
      phase: "done",
    })
  );
  await navTo(page, /Kalender/i);
  await hold(page, P.readBlock);
  await page.getByRole("button", { name: /Reichweite-Hook Tag 10/i }).click();
  await hold(page, P.afterScene);
  await hold(page, P.readBlock);
  const scriptBtn = page.getByRole("button", {
    name: /Jetzt Skript erstellen basierend auf Inhaltsvorschlag/i,
  });
  if (await scriptBtn.isVisible()) {
    await scriptBtn.click();
    await hold(page, P.afterScene * 2);
  }
  await hold(page, P.readBlock);
  await page.keyboard.press("Escape");
  await hold(page, P.afterNav);

  // ═══ Schritt 5: Aufnahme-To-dos (Produktion) ═══
  await navTo(page, /Aufnahme-To-dos/i);
  await hold(page, P.readBlock);
  await slowScroll(page, 360);
  await hold(page, P.readBlock);

  // ═══ Schritt 6: Dashboard — Metriken & Plattformen ═══
  await inject(
    page,
    baseSnapshot({
      zyklus: v1,
      menu: "dashboard",
      performance: perf,
      planVersion: 1,
    })
  );
  await navTo(page, /Dashboard/i);
  await hold(page, P.readBlock);
  await page.getByRole("button", { name: /^Plattformen/i }).click();
  await hold(page, P.afterScene);
  const instagramCard = page.getByRole("button", { name: /Instagram/i }).first();
  if (await instagramCard.isVisible()) {
    await instagramCard.click();
    await hold(page, P.afterScene);
    await hold(page, P.readBlock);
    await page.keyboard.press("Escape");
    await hold(page, P.afterNav);
  }
  await page.getByRole("button", { name: /^Plattformen/i }).click();
  await hold(page, P.afterClick);
  await slowScroll(page, 280);
  await hold(page, P.readBlock);

  // ═══ Schritt 7: Loop — Learnings, Plan v2, Monats-Feedback ═══
  await inject(
    page,
    baseSnapshot({
      zyklus: v2,
      menu: "dashboard",
      performance: perf,
      learnings: DEMO_LEARNINGS,
      learningsMock: true,
      planDiff: diff,
      planVersion: 2,
    })
  );
  await hold(page, P.afterScene);
  await page.getByText("Feedback & Loop").first().scrollIntoViewIfNeeded();
  await hold(page, P.readBlock);
  await slowScroll(page, 220);
  await hold(page, P.readBlock);
  const feedbackSelect = page.locator("select").last();
  if (await feedbackSelect.isVisible()) {
    await feedbackSelect.selectOption({ label: "Dokument erstellen" });
    await hold(page, P.afterScene * 2);
    await page.getByText("Vorschau einblenden").click().catch(() => {});
    await hold(page, P.readBlock);
  }

  // ═══ Schritt 8: Kalender Plan v2 ═══
  await inject(
    page,
    baseSnapshot({
      zyklus: v2,
      menu: "calendar",
      learnings: DEMO_LEARNINGS,
      planDiff: diff,
      planVersion: 2,
    })
  );
  await navTo(page, /Kalender/i);
  await hold(page, P.readBlock);
  await page.getByRole("button", { name: /Reichweite-Hook Tag 15/i }).click();
  await hold(page, P.afterScene);
  await hold(page, P.readBlock);
  await page.keyboard.press("Escape");
  await hold(page, P.afterNav);

  // Haltephase bis Ziel-Länge (ruhiger Abschluss auf Dashboard)
  const elapsed = Date.now() - t0;
  const remaining = TARGET_SECONDS * 1000 - elapsed;
  if (remaining > 2000) {
    await navTo(page, /Dashboard/i);
    await page.getByText("Feedback & Loop").first().scrollIntoViewIfNeeded();
    await hold(page, Math.min(remaining, 6000));
  }

  await context.close();
  await browser.close();

  const webms = fs
    .readdirSync(videoDir)
    .filter((f) => f.endsWith(".webm"))
    .map((f) => ({
      f,
      m: fs.statSync(path.join(videoDir, f)).mtimeMs,
    }))
    .sort((a, b) => b.m - a.m);

  const latest = webms[0]?.f;
  if (!latest) {
    console.warn("Keine WebM-Datei in", videoDir);
    return;
  }

  const destWebm = path.join(videoDir, "contentpilot-demo-2min.webm");
  fs.renameSync(path.join(videoDir, latest), destWebm);
  console.log("WebM:", destWebm, `(Scale ${DEVICE_SCALE}×, Ziel ${TARGET_SECONDS}s)`);

  const destMp4 = path.join(videoDir, "contentpilot-demo-2min.mp4");
  const ffmpegBin =
    process.env.FFMPEG_PATH ??
    ["/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "ffmpeg"].find(
      (p) => p === "ffmpeg" || fs.existsSync(p)
    ) ??
    "ffmpeg";
  try {
    execSync(
      `"${ffmpegBin}" -y -i "${destWebm}" -t ${TARGET_SECONDS} -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart "${destMp4}"`,
      { stdio: "inherit" }
    );
    console.log("MP4:", destMp4);
  } catch {
    console.log("Hinweis: ffmpeg nicht gefunden — nur WebM erzeugt.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
