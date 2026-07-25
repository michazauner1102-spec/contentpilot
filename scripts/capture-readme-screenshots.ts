/**
 * Erzeugt README-Screenshots (Dev-Server muss laufen: npm run dev).
 * Usage: npx tsx scripts/capture-readme-screenshots.ts
 */
import { chromium } from "playwright";
import path from "path";
import { fileURLToPath } from "url";
import {
  buildDemoZyklus,
  DEMO_NISCHE,
  DEMO_RESEARCH,
} from "../lib/demo/mockData.ts";

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
      praezisierteNische: DEMO_NISCHE,
      referentCreator: "Max Mustermann",
      contentVision:
        "30 Tage sichtbar werden: Reichweite, Vertrauen, Conversion im Mix.",
      tonality: DEMO_RESEARCH.tonality,
    },
    research: DEMO_RESEARCH,
    researchCycle: 1,
    researchThemen: [],
    brainstormIdeas: [],
    zyklus: buildDemoZyklus(1),
    productionGuide: null,
    progressLog: [],
    recordedIds: [],
    learnings: null,
    planDiff: null,
    planVersion: 1,
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
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(600);
}

async function shot(page: import("playwright").Page, name: string) {
  await page.screenshot({
    path: path.join(outDir, name),
    fullPage: false,
  });
  console.log("saved", name);
}

async function clickNav(page: import("playwright").Page, label: string) {
  await page.getByRole("button", { name: new RegExp(label, "i") }).click();
  await page.waitForTimeout(500);
}

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  await seedAndReload(page, demoSnapshot("calendar"));
  await shot(page, "01-kalender.png");

  await clickNav(page, "Dashboard");
  await shot(page, "02-dashboard.png");

  await clickNav(page, "Human in the Loop");
  await shot(page, "03-human-in-the-loop.png");

  await clickNav(page, "Aufnahme-To-dos");
  await shot(page, "04-aufnahme-todos.png");

  await seedAndReload(
    page,
    demoSnapshot("calendar", { showSetup: undefined })
  );
  await page.getByRole("button", { name: /Plan-Setup öffnen/i }).click();
  await page.waitForTimeout(400);
  await shot(page, "05-plan-setup.png");

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
