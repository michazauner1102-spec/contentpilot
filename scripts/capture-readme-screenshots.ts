/**
 * Erzeugt README-Screenshots (Dev-Server: npm run dev).
 * PLAYWRIGHT_BROWSERS_PATH=0 npm run screenshots
 */
import { chromium } from "playwright";
import fs from "fs";
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
const outDir = path.join(__dirname, "../docs/screenshots");
const baseUrl = "http://127.0.0.1:3000";
const STORAGE_KEY = "contentpilot.flow.v1";

const emptyAnswers = {
  zielgruppeDetail: "Selbstständige Handwerker in Baden-Württemberg",
  contentZiel30Tage: "Mehr Anfragen über Instagram Reels",
  formatPraeferenz: "Kurze Talking-Head-Videos + B-Roll",
  noGos: "Kein Hard-Selling, keine Stock-Footage-Only-Clips",
  zeitBudgetProWoche: "3–4 Stunden",
};

function demoSnapshot(menu: string, extra: Record<string, unknown> = {}) {
  const v1 = buildDemoZyklus(1);
  return {
    phase: "done",
    menu,
    nische: DEMO_NISCHE,
    referentCreator: "Handwerker-Creator (Demo)",
    answers: emptyAnswers,
    creatorSuggestion: {
      creatorName: "Max Mustermann",
      warumRelevant: "Bodenständiger Stil, starke Hooks für Handwerk.",
      uebernehmbareElemente: ["Talking Head", "B-Roll Wechsel"],
      formate: ["talking_head", "tutorial"],
      hookBeispiele: ["Die 3 Fehler auf Instagram"],
      referenzVideos: [],
    },
    briefing: {
      nische: DEMO_NISCHE,
      praezisierteNische: DEMO_NISCHE,
      referentCreator: "Max Mustermann",
      answers: emptyAnswers,
      contentVision:
        "30 Tage sichtbar werden: Reichweite, Vertrauen, Conversion im Mix.",
      tonality: DEMO_RESEARCH.tonality,
    },
    research: DEMO_RESEARCH,
    researchCycle: 1,
    researchThemen: [],
    brainstormIdeas: [],
    zyklus: v1,
    productionGuide: null,
    progressLog: [],
    recordedIds: [],
    learnings: null,
    planDiff: null,
    planVersion: 1,
    performance: [] as unknown[],
    ...extra,
  };
}

async function seedAndReload(
  page: import("playwright").Page,
  snapshot: Record<string, unknown>
) {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.evaluate(
    ({ key, data }) => localStorage.setItem(key, JSON.stringify(data)),
    { key: STORAGE_KEY, data: snapshot }
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1200);
}

async function shot(page: import("playwright").Page, name: string) {
  await page.screenshot({
    path: path.join(outDir, name),
    fullPage: false,
  });
  console.log("saved", name);
}

async function clickNav(page: import("playwright").Page, label: string) {
  await page.getByRole("button", { name: new RegExp(label, "i") }).first().click();
  await page.waitForTimeout(700);
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const v1 = buildDemoZyklus(1);
  const v2 = buildDemoZyklus(2);
  const perf = buildDemoPerformance(v1);
  const diff = computePlanDiff(v1.plan, v2.plan);

  // Kalender mit Tag-Detail (Inhaltsvorschlag + Skript)
  await seedAndReload(page, demoSnapshot("calendar", { zyklus: v1 }));
  await page.getByRole("heading", { name: "Kalender" }).waitFor({ timeout: 15000 });
  await page.getByRole("button", { name: /Tag 10/i }).first().click();
  await page.waitForTimeout(1200);
  const scriptBtn = page.getByRole("button", {
    name: /Skript rechts anzeigen|Jetzt Skript erstellen/i,
  });
  if (await scriptBtn.isVisible().catch(() => false)) {
    await scriptBtn.click();
    await page.waitForTimeout(800);
  }
  await shot(page, "01-kalender.png");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);

  // Dashboard: KPIs + Feedback & Loop (Plan v2)
  await seedAndReload(
    page,
    demoSnapshot("dashboard", {
      zyklus: v2,
      planVersion: 2,
      performance: perf,
      learnings: DEMO_LEARNINGS,
      learningsMock: true,
      planDiff: diff,
    })
  );
  await page.getByText("Feedback & Loop").first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await shot(page, "02-dashboard.png");

  await clickNav(page, "Human in the Loop");
  await shot(page, "03-human-in-the-loop.png");

  await clickNav(page, "Aufnahme-To-dos");
  await shot(page, "04-aufnahme-todos.png");

  await seedAndReload(page, demoSnapshot("calendar", { zyklus: v1 }));
  await page.getByRole("button", { name: /Plan-Setup öffnen/i }).click();
  await page.waitForTimeout(700);
  await shot(page, "05-plan-setup.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
