/**
 * 2-Minuten-Demo-Video (Playwright Screen Recording).
 * Voraussetzung: npm run dev
 * Ausführen: PLAYWRIGHT_BROWSERS_PATH=0 npm run demo:video
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildDemoPerformance,
  buildDemoZyklus,
  DEMO_DIFF,
  DEMO_LEARNINGS,
  DEMO_NISCHE,
  DEMO_RESEARCH,
} from "../lib/demo/mockData";
import { computePlanDiff } from "../lib/planDiff";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const videoDir = path.join(__dirname, "../demo/video");
const baseUrl = "http://127.0.0.1:3000";
const STORAGE_KEY = "contentpilot.flow.v1";
const TARGET_SECONDS = 120;

const answers = {
  zielgruppeDetail:
    "Selbstständige Handwerker in Stuttgart — 25–45, regional, wenig Zeit",
  contentZiel30Tage: "30 Tage sichtbar werden, 5 qualifizierte Anfragen",
  formatPraeferenz: "Talking Head + kurze Tutorials, max. 60 Sekunden",
  noGos: "Kein Hard-Selling, keine Stock-Only-Videos",
  zeitBudgetProWoche: "3–4 Stunden pro Woche",
};

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
    brainstormIdeas: [],
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
  await page.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data: snapshot }
  );
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(800);
}

async function pause(page: import("playwright").Page, ms: number) {
  await page.waitForTimeout(ms);
}

async function clickNav(page: import("playwright").Page, label: RegExp) {
  await page.getByRole("button", { name: label }).click();
  await pause(page, 900);
}

async function main() {
  fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    recordVideo: { dir: videoDir, size: { width: 1920, height: 1080 } },
  });

  const page = await context.newPage();
  const t0 = Date.now();

  // —— 1. Einstieg: Plan-Setup (Planungsprozess) ——
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await pause(page, 2500);
  await page.getByRole("button", { name: /Plan-Setup starten/i }).click();
  await pause(page, 2000);
  const nischeInput = page.locator('input[placeholder*="Handwerker"]');
  await nischeInput.fill(DEMO_NISCHE);
  await pause(page, 800);
  await page
    .locator('input[placeholder*="Creator"]')
    .fill("Max Handwerk — Referenz-Creator");
  await pause(page, 1200);
  await page.getByRole("button", { name: /Weiter zu 5 Fragen/i }).click();
  await pause(page, 1500);
  const wizardSelect = page.locator("select").first();
  if (await wizardSelect.isVisible()) {
    await wizardSelect.selectOption({ label: "Lokale Selbstständige / KMU" });
    await pause(page, 800);
  }
  await page.locator("textarea").first().fill(answers.zielgruppeDetail);
  await pause(page, 1200);
  await page.getByRole("button", { name: /Nächste Frage/i }).click();
  await pause(page, 1500);

  // —— 2. Human in the Loop (Research & Freigabe) ——
  const v1 = buildDemoZyklus(1);
  await inject(
    page,
    baseSnapshot({
      phase: "research",
      menu: "hitl",
      zyklus: null,
    })
  );
  await clickNav(page, /Human in the Loop/i);
  await pause(page, 4000);
  await page.mouse.wheel(0, 500);
  await pause(page, 3500);

  // —— 3. Kalender Monat 1 ——
  await inject(
    page,
    baseSnapshot({
      zyklus: v1,
      menu: "calendar",
      planVersion: 1,
    })
  );
  await clickNav(page, /Kalender/i);
  await pause(page, 2000);
  await page.getByRole("button", { name: /Reichweite-Hook Tag 5/i }).click();
  await pause(page, 4500);
  await page.keyboard.press("Escape");
  await pause(page, 1200);

  // —— 4. Aufnahme-To-dos ——
  await clickNav(page, /Aufnahme-To-dos/i);
  await pause(page, 4000);
  await page.mouse.wheel(0, 400);
  await pause(page, 2500);

  // —— 5. Dashboard & Insights ——
  const perf = buildDemoPerformance(v1);
  await inject(
    page,
    baseSnapshot({
      zyklus: v1,
      menu: "dashboard",
      performance: perf,
      planVersion: 1,
    })
  );
  await clickNav(page, /Dashboard/i);
  await pause(page, 4000);
  await page.mouse.wheel(0, 450);
  await pause(page, 2500);
  await page
    .getByRole("button", { name: /Klicken für Großansicht/i })
    .first()
    .click();
  await pause(page, 5000);
  await page.keyboard.press("Escape");
  await pause(page, 1200);
  await page.mouse.wheel(0, 650);
  await pause(page, 3500);

  // Learnings & Plan-v2-Vorschau (Diff)
  const v2 = buildDemoZyklus(2);
  const diff = computePlanDiff(v1.plan, v2.plan);
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
  await pause(page, 2500);
  await page.mouse.wheel(0, 750);
  await pause(page, 4000);

  // —— 6. Kalender Monat 2 (Plan v2) ——
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
  await clickNav(page, /Kalender/i);
  await pause(page, 3500);
  await page.getByRole("button", { name: /Reichweite-Hook Tag 15/i }).click();
  await pause(page, 4500);
  await page.keyboard.press("Escape");
  await pause(page, 800);
  await page.mouse.wheel(0, 550);
  await pause(page, 3500);

  // Auffüllen bis ~2 Minuten
  const elapsed = Date.now() - t0;
  const remaining = TARGET_SECONDS * 1000 - elapsed;
  if (remaining > 0) {
    await pause(page, remaining);
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
  if (latest) {
    const dest = path.join(videoDir, "contentpilot-demo-2min.webm");
    fs.renameSync(path.join(videoDir, latest), dest);
    console.log("Video gespeichert:", dest);
  } else {
    console.warn("Keine WebM-Datei gefunden in", videoDir);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
