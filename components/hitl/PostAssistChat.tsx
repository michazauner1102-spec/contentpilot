"use client";

import { useState } from "react";
import type {
  ContentBriefing,
  ResearchResult,
  VideoDetails,
} from "@/lib/types";
import { BTN_ACCENT, BTN_SECONDARY, INPUT_FIELD } from "@/lib/ui/theme";

interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

interface PostAssistChatProps {
  video: VideoDetails;
  briefing?: ContentBriefing | null;
  research?: ResearchResult | null;
  onApplyPatch: (updated: VideoDetails) => void;
}

const QUICK = [
  "Hook schärfer machen",
  "Anderen Winkel vorschlagen",
  "Skript kürzer und sprechbarer",
  "Grafik-/Thumbnail-Idee",
];

export function PostAssistChat({
  video,
  briefing,
  research,
  onApplyPatch,
}: PostAssistChatProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatTurn[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPatch, setPendingPatch] = useState<Partial<VideoDetails> | null>(
    null
  );

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || busy) return;
    setBusy(true);
    setError(null);
    setPendingPatch(null);
    const nextHistory: ChatTurn[] = [
      ...history,
      { role: "user", content: message },
    ];
    setHistory(nextHistory);
    setInput("");
    try {
      const res = await fetch("/api/hitl/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          history: nextHistory.slice(0, -1),
          video,
          briefing: briefing ?? undefined,
          research: research ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Chat fehlgeschlagen");

      setHistory((h) => [
        ...h,
        { role: "assistant", content: String(data.reply ?? "") },
      ]);

      if (data.applySuggested && data.patch) {
        const patch = data.patch as {
          title?: string;
          hook?: string;
          begruendung?: string;
          skript?: { hook?: string; body?: string; cta?: string };
          grafikVorschlag?: string;
        };
        const updated: VideoDetails = {
          ...video,
          ...(patch.title ? { title: patch.title } : {}),
          ...(patch.hook ? { hook: patch.hook } : {}),
          ...(patch.begruendung ? { begruendung: patch.begruendung } : {}),
          ...(patch.grafikVorschlag
            ? { grafikVorschlag: patch.grafikVorschlag }
            : {}),
          skript: {
            hook: patch.skript?.hook ?? video.skript?.hook ?? "",
            body: patch.skript?.body ?? video.skript?.body ?? "",
            cta: patch.skript?.cta ?? video.skript?.cta ?? "",
          },
        };
        setPendingPatch(updated);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat fehlgeschlagen");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)]/40 p-3">
      <div>
        <h3 className="text-xs uppercase tracking-wider text-[var(--muted)]">
          Anpassen mit KI
        </h3>
        <p className="text-[11px] text-[var(--muted)] mt-0.5">
          Frag nach Alternativen oder sag, was geändert werden soll — du
          entscheidest, was übernommen wird.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button
            key={q}
            type="button"
            disabled={busy}
            onClick={() => void send(q)}
            className="rounded-md border border-[var(--border)] px-2 py-1 text-[11px] hover:bg-[var(--surface)] disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <ul className="max-h-48 overflow-y-auto space-y-2 text-xs">
          {history.map((m, i) => (
            <li
              key={`${m.role}-${i}`}
              className={
                m.role === "user"
                  ? "text-[var(--foreground)]"
                  : "text-[var(--muted-strong)]"
              }
            >
              <span className="font-medium">
                {m.role === "user" ? "Du" : "Assist"}:{" "}
              </span>
              <span className="whitespace-pre-wrap">{m.content}</span>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-xs text-red-400/90">{error}</p>}

      {pendingPatch && (
        <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--surface)] p-2 space-y-2">
          <p className="text-[11px] text-[var(--muted)]">
            Vorschlag bereit — übernehmen oder verwerfen.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`${BTN_ACCENT} text-xs py-1.5 px-3`}
              onClick={() => {
                onApplyPatch(pendingPatch as VideoDetails);
                setPendingPatch(null);
                setHistory((h) => [
                  ...h,
                  {
                    role: "assistant",
                    content: "Änderung übernommen. Du kannst weiter feinjustieren.",
                  },
                ]);
              }}
            >
              Übernehmen
            </button>
            <button
              type="button"
              className={`${BTN_SECONDARY} text-xs py-1.5 px-3`}
              onClick={() => setPendingPatch(null)}
            >
              Verwerfen
            </button>
          </div>
        </div>
      )}

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          className={`${INPUT_FIELD} text-sm py-2`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="z. B. mehr Proof im Body, weniger Sales…"
          disabled={busy}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className={`${BTN_SECONDARY} shrink-0 text-xs px-3`}
        >
          {busy ? "…" : "Senden"}
        </button>
      </form>
    </section>
  );
}
