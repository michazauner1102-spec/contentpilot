/**
 * Smoke-Test: Login, Accounts, Routen-Schutz und UI.
 * Voraussetzung: `npm run dev` auf Port 3000.
 */
import { chromium } from "playwright";
import { emptyPersistedFlow } from "../lib/accounts/flowPersistence";

const BASE = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

const failures: string[] = [];
let cookie = "";

function check(label: string, ok: boolean, detail?: string) {
  if (ok) {
    console.log(`  ok   ${label}`);
  } else {
    console.error(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`);
    failures.push(label);
  }
}

async function api(
  path: string,
  init?: { method?: string; body?: unknown; redirect?: RequestRedirect }
) {
  const res = await fetch(`${BASE}${path}`, {
    method: init?.method ?? "GET",
    redirect: init?.redirect ?? "manual",
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { cookie } : {}),
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  const setCookie = res.headers.getSetCookie?.() ?? [];
  for (const c of setCookie) {
    if (c.startsWith("contentpilot_session=")) cookie = c.split(";")[0];
  }

  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    /* keine JSON-Antwort (z. B. Redirect) */
  }
  return { status: res.status, data };
}

async function main() {
  console.log("=== ContentPilot Smoke-Test ===");
  console.log(`Base: ${BASE}\n`);

  console.log("Öffentlich:");
  const health = await api("/api/health/ai");
  check("GET /api/health/ai → 200", health.status === 200, `${health.status}`);
  console.log(`       Storage: ${health.data.storage}, Live-KI: ${health.data.liveAiEnabled}`);

  const home = await api("/");
  check(
    "GET / ohne Login → Redirect auf /login",
    home.status === 307 || home.status === 302,
    `${home.status}`
  );

  const guarded = await api("/api/onboarding/research", {
    method: "POST",
    body: {},
  });
  check(
    "POST /api/onboarding/research ohne Login → 401",
    guarded.status === 401,
    `${guarded.status}`
  );

  const guardedWs = await api("/api/workspaces");
  check(
    "GET /api/workspaces ohne Login → 401",
    guardedWs.status === 401,
    `${guardedWs.status}`
  );

  console.log("\nRegistrierung & Session:");
  const email = `smoke-${Date.now()}@example.test`;
  const weak = await api("/api/auth/register", {
    method: "POST",
    body: { email, password: "kurz" },
  });
  check(
    "Schwaches Passwort → 400",
    weak.status === 400,
    `${weak.status}`
  );

  const reg = await api("/api/auth/register", {
    method: "POST",
    body: { email, password: "smoke-test-1", name: "Smoke" },
  });
  check("Registrieren → 200", reg.status === 200, JSON.stringify(reg.data));
  check("Session-Cookie gesetzt", cookie.length > 0);

  const workspaces = (reg.data.workspaces ?? []) as { id: string }[];
  const firstId = workspaces[0]?.id;
  check("Erster Plan automatisch angelegt", Boolean(firstId));

  const dup = await api("/api/auth/register", {
    method: "POST",
    body: { email, password: "smoke-test-1" },
  });
  check("Doppelte E-Mail → 409", dup.status === 409, `${dup.status}`);

  const me = await api("/api/auth/me");
  check(
    "GET /api/auth/me → eingeloggt",
    me.status === 200 && (me.data.user as { email?: string })?.email === email
  );

  console.log("\nPläne (Accounts):");
  const flow = { ...emptyPersistedFlow(), nische: "Smoke Nische" };
  const put = await api(`/api/workspaces/${firstId}/flow`, {
    method: "PUT",
    body: { flow },
  });
  check("Flow speichern → 200", put.status === 200, `${put.status}`);

  const get = await api(`/api/workspaces/${firstId}/flow`);
  check(
    "Flow lesen → gleicher Stand",
    (get.data.flow as { nische?: string })?.nische === "Smoke Nische"
  );

  const created = await api("/api/workspaces", {
    method: "POST",
    body: { name: "Zweiter Plan" },
  });
  check("Zweiten Plan anlegen → 200", created.status === 200, `${created.status}`);
  const secondId = (created.data.workspace as { id?: string })?.id;

  const renamed = await api(`/api/workspaces/${secondId}`, {
    method: "PATCH",
    body: { name: "Umbenannt" },
  });
  check(
    "Plan umbenennen",
    (renamed.data.workspace as { name?: string })?.name === "Umbenannt"
  );

  const del = await api(`/api/workspaces/${secondId}`, { method: "DELETE" });
  check("Plan löschen → 200", del.status === 200, `${del.status}`);

  const delLast = await api(`/api/workspaces/${firstId}`, { method: "DELETE" });
  check(
    "Letzten Plan löschen wird verweigert → 400",
    delLast.status === 400,
    `${delLast.status}`
  );

  console.log("\nFremdzugriff:");
  const ownCookie = cookie;
  cookie = "";
  const otherEmail = `smoke-other-${Date.now()}@example.test`;
  await api("/api/auth/register", {
    method: "POST",
    body: { email: otherEmail, password: "smoke-test-2" },
  });
  const foreign = await api(`/api/workspaces/${firstId}/flow`);
  check(
    "Fremder Plan liefert keinen Inhalt",
    foreign.data.flow === null || foreign.status === 404,
    JSON.stringify(foreign.data).slice(0, 80)
  );
  cookie = ownCookie;

  console.log("\nUI:");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ baseURL: BASE });
  const page = await context.newPage();
  try {
    await page.goto("/", { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForURL("**/login", { timeout: 15_000 });
    check("Ohne Login landet man auf /login", true);

    const uiEmail = `smoke-ui-${Date.now()}@example.test`;
    await page.getByRole("button", { name: /Jetzt registrieren/i }).click();
    await page.getByLabel("E-Mail").fill(uiEmail);
    await page.getByLabel("Passwort").fill("smoke-test-1");
    await page.getByRole("button", { name: "Konto anlegen" }).click();

    await page.waitForURL(
      (url) => !url.pathname.startsWith("/login"),
      { timeout: 30_000 }
    );
    check("Registrieren im UI führt in die App", true);

    await page.getByRole("button", { name: "+ Neuer Account" }).waitFor({
      timeout: 20_000,
    });
    check("Plan-Umschalter sichtbar", true);

    await page.getByRole("button", { name: /Human in the Loop/i }).click();
    await page
      .getByRole("heading", { name: "Human in the Loop", exact: true })
      .waitFor({ timeout: 15_000 });
    check("Human-in-the-Loop-Seite lädt", true);

    await page.getByRole("button", { name: "Ausloggen" }).click();
    await page.waitForURL("**/login", { timeout: 15_000 });
    check("Ausloggen führt zurück auf /login", true);
  } catch (e) {
    check("UI-Flow", false, e instanceof Error ? e.message.slice(0, 200) : String(e));
  } finally {
    await browser.close();
  }

  console.log("\n=== Ergebnis ===");
  if (failures.length) {
    console.error(`${failures.length} Check(s) fehlgeschlagen.`);
    process.exit(1);
  }
  console.log("Alle Smoke-Checks bestanden.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
