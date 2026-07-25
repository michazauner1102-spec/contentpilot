/**
 * Prüft LLM-/Research-Konfiguration und optional Live-API-Aufrufe gegen laufenden Dev-Server.
 *
 *   npm run dev
 *   FORCE_MOCK_ONLY=false LLM_PROVIDER=anthropic ANTHROPIC_API_KEY=sk-… npm run verify:llm
 *
 * Lädt .env.local automatisch (ohne Werte auszugeben).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

function loadEnvLocal() {
  const p = path.join(root, ".env.local");
  if (!fs.existsSync(p)) return;
  const text = fs.readFileSync(p, "utf8");
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnvLocal();

const baseUrl = process.env.VERIFY_BASE_URL ?? "http://127.0.0.1:3000";

async function getJson(pathname: string, init?: RequestInit) {
  const res = await fetch(`${baseUrl}${pathname}`, init);
  const data = (await res.json()) as Record<string, unknown>;
  return { res, data };
}

async function main() {
  const { liveAiStatus } = await import("../lib/demo/liveAi");

  console.log("=== ContentPilot LLM / Research Verify ===\n");

  const status = liveAiStatus();
  console.log("Konfiguration:");
  console.log(`  FORCE_MOCK_ONLY:     ${status.forceMockOnly}`);
  console.log(`  LLM konfiguriert:    ${status.llmConfigured} (${status.label})`);
  console.log(`  Live-KI aktiv:       ${status.liveAiEnabled}`);
  console.log(
    `  NEXT_PUBLIC_DEMO:    ${process.env.NEXT_PUBLIC_DEMO_MODE ?? "(nicht gesetzt)"} (nur UI-Banner)\n`
  );

  if (process.env.NEXT_PUBLIC_DEMO_MODE === "true" && !status.forceMockOnly) {
    console.log(
      "OK: Demo-Banner kann an bleiben — LLM läuft trotzdem, wenn Key gesetzt ist.\n"
    );
  }

  if (status.forceMockOnly) {
    console.log(
      "Hinweis: FORCE_MOCK_ONLY=true blockiert alle externen APIs. Für echte KI: false setzen.\n"
    );
  }

  if (!status.llmConfigured) {
    console.log(
      "Kein LLM-Key — überspringe Live-HTTP-Tests. Setze LLM_PROVIDER + passenden Key in .env.local\n"
    );
    process.exit(status.forceMockOnly ? 0 : 1);
  }

  if (status.forceMockOnly) {
    process.exit(0);
  }

  try {
    await fetch(baseUrl, { signal: AbortSignal.timeout(3000) });
  } catch {
    console.error(
      `Dev-Server nicht erreichbar unter ${baseUrl}. Starte: npm run dev\n`
    );
    process.exit(1);
  }

  const health = await getJson("/api/health/ai");
  if (!health.res.ok || health.data.liveAiEnabled !== true) {
    console.error("GET /api/health/ai:", health.data);
    process.exit(1);
  }
  console.log("GET /api/health/ai … OK\n");

  const sampleBriefing = {
    nische: "Handwerker Social Media Stuttgart",
    praezisierteNische: "Selbstständige Handwerker, 25–45, regional",
    referentCreator: "Beispiel Creator",
    zielgruppeDetail: "Lokale Auftraggeber",
    contentZiel30Tage: "Mehr Anfragen",
    formatPraeferenz: "Talking Head",
    noGos: "Hard Selling",
    zeitBudgetProWoche: "3h",
  };

  const sampleResearch = {
    zielgruppe: "Handwerker und Bauherren in der Region",
    painPoints: ["Zeitmangel", "Keine Ideen", "Unsicher vor Kamera"] as [
      string,
      string,
      string,
    ],
    hookMuster: ["Vorher/Nachher", "3 Fehler", "FAQ"],
    tonality: "nahbar, kompetent",
  };

  const tests: { name: string; run: () => Promise<void> }[] = [
    {
      name: "Brainstorm",
      run: async () => {
        const { res, data } = await getJson("/api/brainstorm/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ briefing: sampleBriefing }),
        });
        if (!res.ok) throw new Error(String(data.error ?? res.status));
        if (!Array.isArray(data.ideas) || data.ideas.length < 3) {
          throw new Error("Zu wenig Brainstorm-Ideen");
        }
        if (data.mock === true) throw new Error("Unerwartet mock:true");
      },
    },
    {
      name: "Research (Web + LLM)",
      run: async () => {
        const { res, data } = await getJson("/api/onboarding/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            briefing: sampleBriefing,
            cycle: 1,
            focus: ["zielgruppe", "hooks"],
            webProvider: "auto",
          }),
        });
        if (!res.ok) throw new Error(String(data.error ?? res.status));
        if (data.mock === true) throw new Error("Research fiel auf Mock zurück");
        const r = data.research as { zielgruppe?: string } | undefined;
        if (!r?.zielgruppe?.trim()) throw new Error("Research ohne Zielgruppe");
      },
    },
    {
      name: "Trend-Vorschläge",
      run: async () => {
        const { res, data } = await getJson("/api/onboarding/suggest-trends", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nische: sampleBriefing.nische,
            questionId: "zielgruppeDetail",
            webProvider: "auto",
          }),
        });
        if (!res.ok) throw new Error(String(data.error ?? res.status));
        const suggestions = data.suggestions as unknown[];
        if (!Array.isArray(suggestions) || suggestions.length === 0) {
          throw new Error("Keine Trend-Vorschläge");
        }
        if (data.source === "mock") throw new Error("Trends nur Mock");
      },
    },
    {
      name: "Briefing refine",
      run: async () => {
        const answers = {
          zielgruppeDetail: sampleBriefing.zielgruppeDetail,
          contentZiel30Tage: sampleBriefing.contentZiel30Tage,
          formatPraeferenz: sampleBriefing.formatPraeferenz,
          noGos: sampleBriefing.noGos,
          zeitBudgetProWoche: sampleBriefing.zeitBudgetProWoche,
        };
        const { res, data } = await getJson("/api/onboarding/refine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nische: sampleBriefing.nische,
            referentCreator: sampleBriefing.referentCreator,
            answers,
          }),
        });
        if (!res.ok) throw new Error(String(data.error ?? res.status));
        if (data.mock === true) throw new Error("Briefing Mock statt LLM");
      },
    },
  ];

  let failed = 0;
  for (const t of tests) {
    process.stdout.write(`${t.name} … `);
    try {
      await t.run();
      console.log("OK");
    } catch (e) {
      failed++;
      console.log("FEHLER");
      console.log(`  ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(
    failed === 0
      ? "\nAlle Live-Tests bestanden."
      : `\n${failed} Test(s) fehlgeschlagen — Fehler oben prüfen (Key, Quota, Netz).`
  );
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
