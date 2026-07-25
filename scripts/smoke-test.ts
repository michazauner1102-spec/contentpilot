/**
 * Schneller Smoke-Test: UI, Accounts, API-Routen (ohne volle KI-Laufzeiten).
 * Voraussetzung: `npm run dev` auf Port 3000.
 */
import { chromium } from "playwright";

const BASE = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

async function apiCheck(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return { path, status: res.status, ok: res.ok };
}

async function main() {
  const failures: string[] = [];

  console.log("=== ContentPilot Smoke Test ===\n");
  console.log(`Base: ${BASE}\n`);

  // API health
  try {
    const health = await apiCheck("/api/health/ai");
    console.log(`GET /api/health/ai → ${health.status}`);
    if (!health.ok) failures.push(`health/ai status ${health.status}`);
  } catch (e) {
    failures.push(`health/ai unreachable: ${e instanceof Error ? e.message : e}`);
  }

  // Research validation (400 without briefing)
  try {
    const bad = await apiCheck("/api/onboarding/research", "POST", {});
    console.log(`POST /api/onboarding/research (empty) → ${bad.status} (expect 400)`);
    if (bad.status !== 400) failures.push(`research empty body expected 400, got ${bad.status}`);
  } catch (e) {
    failures.push(`research route: ${e instanceof Error ? e.message : e}`);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 60_000 });
    console.log("\nUI: Startseite geladen");

    await page
      .getByRole("button", { name: "+ Neuer Account" })
      .waitFor({ timeout: 20_000 });
    console.log("UI: Account-Switcher sichtbar");

    await page.getByRole("button", { name: /Kalender/i }).first().waitFor({ timeout: 5000 });
    console.log("UI: Navigation sichtbar");

    await page.getByRole("button", { name: "▼" }).first().click();
    console.log("UI: Account-Dropdown ok");

    await page.getByRole("button", { name: /Human in the Loop/i }).click();
    await page
      .getByRole("heading", { name: "Human in the Loop", exact: true })
      .waitFor({ timeout: 15_000 });
    console.log("UI: HITL-Seite ok");

    await page.getByRole("button", { name: /Dashboard/i }).click();
    await page.getByText(/Metriken|Performance|Loop/i).first().waitFor({
      timeout: 15_000,
    });
    console.log("UI: Dashboard ok");

    // Account persistenz
    await page.evaluate(() => {
      localStorage.setItem(
        "contentpilot.accounts.v1",
        JSON.stringify({
          activeId: "smoke-test-acc",
          accounts: [
            {
              id: "smoke-test-acc",
              name: "Smoke Test Account",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })
      );
      localStorage.setItem(
        "contentpilot.flow.v1.smoke-test-acc",
        JSON.stringify({
          phase: "briefing",
          menu: "hitl",
          nische: "Smoke Nische",
          referentCreator: "Test Creator",
          answers: {
            zielgruppeDetail: "x",
            contentZiel30Tage: "y",
            formatPraeferenz: "z",
            noGos: "",
            zeitBudgetProWoche: "2h",
          },
          creatorSuggestion: null,
          briefing: {
            nische: "Smoke Nische",
            referentCreator: "Test Creator",
            answers: {
              zielgruppeDetail: "x",
              contentZiel30Tage: "y",
              formatPraeferenz: "z",
              noGos: "",
              zeitBudgetProWoche: "2h",
            },
            praezisierteNische: "Smoke Nische QA",
          },
          research: null,
          researchCycle: 1,
          researchThemen: [],
          brainstormIdeas: [],
          calendars: [],
          activeCalendarId: null,
          zyklus: null,
          productionGuide: null,
          progressLog: [],
          recordedIds: [],
          learnings: null,
          planDiff: null,
          planVersion: 1,
        })
      );
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.getByText("Smoke Test Account").waitFor({ timeout: 10_000 });
    console.log("UI: Account + Flow aus localStorage wiederhergestellt");
  } catch (e) {
    failures.push(`Browser: ${e instanceof Error ? e.message : e}`);
  } finally {
    await browser.close();
  }

  console.log("\n=== Ergebnis ===");
  if (failures.length) {
    failures.forEach((f) => console.error(`✗ ${f}`));
    process.exit(1);
  }
  console.log("✓ Alle Smoke-Checks bestanden");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
