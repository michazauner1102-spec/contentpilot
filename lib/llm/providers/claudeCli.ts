import { extractJson, jsonSystemPrompt } from "../extractJson";

/**
 * Backend-LLM über die lokale `claude` CLI (Claude Code).
 * Nutzt die bestehende Abo-Authentifizierung des Users — kein API-Key nötig.
 * Der User-Prompt geht über stdin, der System-Prompt über --append-system-prompt.
 *
 * node:child_process wird dynamisch geladen, damit der Bundler dieses
 * server-only Modul nicht ins Client-Bundle zieht (planGenerator ist client-importiert).
 */
async function runClaudeCli(
  model: string,
  system: string,
  user: string
): Promise<string> {
  const childProcessSpecifier = "node:child_process";
  const { spawn } = await import(childProcessSpecifier);
  const bin = process.env.CLAUDE_CLI_PATH?.trim() || "claude";
  const args = ["-p", "--output-format", "text", "--append-system-prompt", system];
  // Nur ein explizit gesetztes Modell durchreichen (CLI-Aliase: sonnet/opus/haiku).
  const cliModel = process.env.LLM_MODEL?.trim() || model;
  if (cliModel) args.push("--model", cliModel);

  const timeoutMs = Number(process.env.CLAUDE_CLI_TIMEOUT_MS ?? 120000);

  return new Promise<string>((resolve, reject) => {
    const child = spawn(bin, args, {
      stdio: ["pipe", "pipe", "pipe"],
      env: process.env,
    });

    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`claude CLI Timeout nach ${timeoutMs}ms`));
    }, timeoutMs);

    child.stdout.on("data", (d: Buffer) => (stdout += d.toString()));
    child.stderr.on("data", (d: Buffer) => (stderr += d.toString()));
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
