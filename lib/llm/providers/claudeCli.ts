import { extractJson, jsonSystemPrompt } from "../extractJson";

/**
 * Backend-LLM über die lokale `claude` CLI (Claude Code).
 * Nutzt die bestehende Abo-Authentifizierung des Users — kein API-Key nötig.
 * Der User-Prompt geht über stdin, der System-Prompt über --append-system-prompt.
 *
 * node:child_process wird dynamisch geladen, damit der Bundler dieses
 * server-only Modul nicht ins Client-Bundle zieht (planGenerator ist client-importiert).
 */
/**
 * Globale Serialisierung: nie zwei `claude -p` gleichzeitig. Das Abo drosselt parallele
 * CLI-Sessions massiv (jeder Call würde auf Minuten aufblähen), darum laufen ALLE Calls
 * app-weit streng der Reihe nach. Kostet bei Einzelnutzung nichts, verhindert Throttle-Kollaps.
 */
let cliQueue: Promise<unknown> = Promise.resolve();
function enqueueCli<T>(task: () => Promise<T>): Promise<T> {
  const next = cliQueue.then(task, task);
  cliQueue = next.then(
    () => undefined,
    () => undefined
  );
  return next;
}

async function spawnClaudeCli(
  model: string,
  system: string,
  user: string,
  opts?: { allowedTools?: string; timeoutMs?: number }
): Promise<string> {
  const childProcessSpecifier = "node:child_process";
  const { spawn } = await import(childProcessSpecifier);
  const bin = process.env.CLAUDE_CLI_PATH?.trim() || "claude";
  const args = ["-p", "--output-format", "text", "--append-system-prompt", system];
  // Optional echte Tools erlauben (z. B. WebSearch für Live-Recherche).
  if (opts?.allowedTools) args.push("--allowedTools", opts.allowedTools);
  // Nur ein explizit gesetztes Modell durchreichen (CLI-Aliase: sonnet/opus/haiku).
  const cliModel = process.env.LLM_MODEL?.trim() || model;
  if (cliModel) args.push("--model", cliModel);

  const timeoutMs =
    opts?.timeoutMs ?? Number(process.env.CLAUDE_CLI_TIMEOUT_MS ?? 180000);

  return new Promise<string>((resolve, reject) => {
    // detached: eigene Prozessgruppe → beim Timeout lässt sich der ganze Baum killen
    // (claude spawnt Kinder; child.kill allein ließe Zombies zurück, die weiter drosseln).
    const child = spawn(bin, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
      detached: true,
    });

    const killTree = () => {
      try {
        if (child.pid) process.kill(-child.pid, "SIGKILL");
      } catch {
        /* Gruppe evtl. schon weg */
      }
      try {
        child.kill("SIGKILL");
      } catch {
        /* egal */
      }
    };

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      killTree();
      reject(new Error(`claude CLI Timeout nach ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
    child.stdin.on("error", () => {
      /* EPIPE ignorieren, falls Prozess schon beendet */
    });
    child.on("error", (err: Error) => {
      clearTimeout(timer);
      reject(
        new Error(
          `claude CLI nicht ausführbar (${bin}): ${err.message}. Installiert & eingeloggt?`
        )
      );
    });
    child.on("close", (code: number | null) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(
          new Error(`claude CLI Exit ${code}: ${stderr.slice(0, 300) || "keine Ausgabe"}`)
        );
        return;
      }
      resolve(stdout.trim());
    });

    child.stdin.write(user);
    child.stdin.end();
  });
}

function runClaudeCli(
  model: string,
  system: string,
  user: string,
  opts?: { allowedTools?: string; timeoutMs?: number }
): Promise<string> {
  return enqueueCli(() => spawnClaudeCli(model, system, user, opts));
}

export async function claudeCliJson<T>(
  model: string,
  system: string,
  user: string,
  schemaHint?: string
): Promise<T> {
  const systemFull = jsonSystemPrompt(system, schemaHint);
  const run = async (): Promise<T> => {
    const out = await runClaudeCli(model, systemFull, user);
    return JSON.parse(extractJson(out)) as T;
  };
  try {
    return await run();
  } catch (err) {
    if (err instanceof SyntaxError) return await run();
    throw err;
  }
}

export async function claudeCliText(
  model: string,
  system: string,
  user: string
): Promise<string> {
  return runClaudeCli(model, system, user);
}

/**
 * Echte Web-Recherche über die CLI (WebSearch-Tool). Nutzt dein Abo, kein Key.
 * Ein Aufruf deckt mehrere Fragen ab (spart Zeit ggü. einem Call pro Query).
 */
const CLI_RESEARCH_SYSTEM =
  "Du bist Research-Assistent für Social-Media- und Video-Content-Strategie. " +
  "Nutze WebSearch für AKTUELLE, belastbare Fakten und Trends — verlasse dich nicht nur auf dein Vorwissen. " +
  "Antworte faktenorientiert auf Deutsch, kompakt in Bullet Points, und nenne pro Aussage die Quellen-URL.";

export async function claudeCliResearch(
  model: string,
  queries: string[]
): Promise<string> {
  const user =
    "Recherchiere im Web aktuelle, belastbare Fakten und Trends zu diesen Punkten:\n" +
    queries.map((q, i) => `${i + 1}. ${q}`).join("\n") +
    "\n\nGib je Punkt 2–4 Bullet Points mit Quellen-URLs.";
  const timeoutMs = Number(process.env.CLAUDE_CLI_RESEARCH_TIMEOUT_MS ?? 150000);
  return runClaudeCli(model, CLI_RESEARCH_SYSTEM, user, {
    allowedTools: "WebSearch",
    timeoutMs,
  });
}
