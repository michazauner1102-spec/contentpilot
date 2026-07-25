/**
 * HiDPI-Pitch-Screenshots (2×) für Gamma — scharf auf 1920px-Slides.
 * Dev-Server: npm run dev
 * PLAYWRIGHT_BROWSERS_PATH=0 npm run pitch-screenshots-hd
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildDemoPerformance,
  buildDemoZyklus,
  DEMO_LEARNINGS,
  DEMO_NISCHE,
  DEMO_RESEARCH,
} from "../lib/demo/mockData";
import { computePlanDiff } from "../lib/planDiff";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../mockups");
const baseUrl = "http://127.0.0.1:3000";
const STORAGE_KEY = "contentpilot.flow.v1";

/** Logische Größe; deviceScaleFactor 2 → ~3840×2160 px Export */
const VIEWPORT = { width: 1920, height: 1080 };
const SCALE = 2;
const FRAME_MARGIN_PX = 96;

const answers = {
  zielgruppeDetail:
    "Selbstständige Handwerker in Stuttgart — regional, wenig Zeit für Content",
  contentZiel30Tage: "30 Tage sichtbar werden, messbare Anfragen",
  formatPraeferenz: "Talking Head + Tutorials unter 60 Sekunden",
  noGos: "Kein Hard-Selling",
  zeitBudgetProWoche: "3–4 Stunden pro Woche",
};

function baseSnapshot(overrides: Record<string, unknown> = {}) {
  return {
    phase: "wizard",
    menu: "calendar",
    nische: DEMO_NISCHE,
    referentCreator: "Max Handwerk (Referenz-Creator)",
    answers,
    creatorSuggestion: null,
    briefing: null,
    research: DEMO_RESEARCH,
    researchCycle: 1,
    researchThemen: [],
    brainstormIdeas: [],
    zyklus: null,
    productionGuide: null,
    progressLog: [],
    recordedIds: [],
    learnings: null,
    planDiff: null,
    planVersion: 1,
    ...overrides,
  };
}

async function inject(
  page: import("playwright").Page,
  snapshot: Record<string, unknown>
) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data: snapshot }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);
}

async function whiteFrame(page: import("playwright").Page) {
  await page.evaluate((margin) => {
    document.documentElement.style.background = "#ffffff";
    document.body.style.background = "#ffffff";
    document.body.style.margin = "0";
    document.body.style.padding = `${margin}px`;
    document.body.style.boxSizing = "border-box";
    document.body.style.minHeight = "100vh";
  }, FRAME_MARGIN_PX);
  await page.waitForTimeout(120);
}

async function shotFullPage(page: import("playwright").Page, filename: string) {
  await whiteFrame(page);
  await page.screenshot({
    path: path.join(outDir, filename),
    fullPage: true,
    type: "png",
  });
  console.log("saved", filename);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
  });

  // 1 — Planungsformular (Wizard-Frage im Setup)
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate((key) => localStorage.removeItem(key), STORAGE_KEY);
  await page.reload({ waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Plan-Setup starten/i }).click();
  await page.waitForTimeout(500);
  await page.locator("#setup-nische").fill(DEMO_NISCHE);
  await page.locator("#setup-referent").fill("Max Handwerk");
  await page.getByRole("button", { name: /Weiter — 5 kurze Fragen/i }).click();
  await page.waitForTimeout(500);
  const select = page.locator("select").first();
  if (await select.isVisible()) {
    await select.selectOption({ label: "Lokale Selbstständige / KMU" });
  }
  await page.locator("textarea").first().fill(answers.zielgruppeDetail);
  await page.waitForTimeout(400);
  await shotFullPage(page, "01-planungsformular-fragen-2x.png");

  // 2 — Kalender: Tag-Detail mit Inhaltsvorschlag & Skript
  const v1 = buildDemoZyklus(1);
  await inject(
    page,
    baseSnapshot({
      phase: "done",
      zyklus: v1,
      menu: "calendar",
      briefing: {
        nische: DEMO_NISCHE,
        referentCreator: "Max Handwerk",
        answers,
        praezisierteNische: DEMO_NISCHE,
        contentVision: "30-Tage-Loop",
        tonality: DEMO_RESEARCH.tonality,
      },
    })
  );
  await page.getByRole("button", { name: /Reichweite-Hook Tag 10/i }).click();
  await page.waitForTimeout(600);
  await shotFullPage(page, "02-kalender-tag-detail-2x.png");

  // 3 — Feedback / Learnings / Plan v2 (Dashboard unten)
  const v2 = buildDemoZyklus(2);
  const diff = computePlanDiff(v1.plan, v2.plan);
  await inject(
    page,
    baseSnapshot({
      phase: "done",
      menu: "dashboard",
      zyklus: v2,
      planVersion: 2,
      learnings: DEMO_LEARNINGS,
      planDiff: diff,
      performance: buildDemoPerformance(v1),
      briefing: {
        nische: DEMO_NISCHE,
        referentCreator: "Max Handwerk",
        answers,
        praezisierteNische: DEMO_NISCHE,
        contentVision: "Monat 2 aus Learnings",
        tonality: DEMO_RESEARCH.tonality,
      },
    })
  );
  await page.getByRole("button", { name: /Dashboard/i }).click();
  await page.waitForTimeout(800);
  const loopSection = page.getByText("Feedback & Loop").first();
  if (await loopSection.isVisible()) {
    await loopSection.scrollIntoViewIfNeeded();
  }
  await page.waitForTimeout(400);
  await shotFullPage(page, "03-feedback-learnings-planv2-2x.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
