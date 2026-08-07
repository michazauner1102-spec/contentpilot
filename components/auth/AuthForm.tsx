"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BTN_PRIMARY, INPUT_FIELD } from "@/lib/ui/theme";
import { LEGACY_FLOW_STORAGE_KEY } from "@/lib/accounts/flowPersistence";

type Mode = "login" | "register";

export function AuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  /** Alter localStorage-Stand wird beim ersten Login zum Server-Plan. */
  function readLegacyFlow(): unknown | null {
    try {
      const raw = localStorage.getItem(LEGACY_FLOW_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register" ? { email, password, name } : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Fehlgeschlagen");

      if (mode === "register") {
        const legacy = readLegacyFlow();
        if (legacy && data.activeWorkspaceId) {
          await fetch(`/api/workspaces/${data.activeWorkspaceId}/flow`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ flow: legacy }),
          }).catch(() => {});
          try {
            localStorage.removeItem(LEGACY_FLOW_STORAGE_KEY);
          } catch {
            /* ignorieren */
          }
        }
      }

      router.replace("/");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Fehlgeschlagen");
      setPending(false);
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <p className="text-xl font-semibold tracking-tight">ContentPilot</p>
        <p className="text-sm text-[var(--muted)]">
          {mode === "login"
            ? "Einloggen — deine Pläne liegen auf dem Server."
            : "Konto anlegen — danach bleibt jeder Plan gespeichert."}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <div className="space-y-1">
            <label htmlFor="name" className="text-xs text-[var(--muted-strong)]">
              Name (optional)
            </label>
            <input
              id="name"
              className={INPUT_FIELD}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Micha"
            />
          </div>
        )}

        <div className="space-y-1">
          <label htmlFor="email" className="text-xs text-[var(--muted-strong)]">
            E-Mail
          </label>
          <input
            id="email"
            type="email"
            required
            className={INPUT_FIELD}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="du@beispiel.de"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="password"
            className="text-xs text-[var(--muted-strong)]"
          >
            Passwort
          </label>
          <input
            id="password"
            type="password"
            required
            className={INPUT_FIELD}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={
              mode === "register" ? "new-password" : "current-password"
            }
            placeholder={mode === "register" ? "min. 8 Zeichen, 1 Zahl" : "••••••••"}
          />
        </div>

        {error && (
          <p className="text-xs text-red-400/90 rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2">
            {error}
          </p>
        )}

        <button type="submit" disabled={pending} className={`${BTN_PRIMARY} w-full`}>
          {pending
            ? "Moment…"
            : mode === "login"
              ? "Einloggen"
              : "Konto anlegen"}
        </button>
      </form>

      <button
        type="button"
        className="w-full text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
      >
        {mode === "login"
          ? "Noch kein Konto? Jetzt registrieren"
          : "Schon ein Konto? Zum Login"}
      </button>
    </div>
  );
}
