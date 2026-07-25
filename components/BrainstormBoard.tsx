"use client";

import { useState } from "react";
import type { ContentBriefing } from "@/lib/types";
import type { BrainstormIdea, BrainstormStatus, ContentPillar } from "@/lib/brainstorm/contentPillars";
import {
  PILLAR_META,
  PILLAR_COLUMN_CLASS,
  STATUS_LABELS,
  STATUS_STYLES,
  SUPERHOOK_COPY,
} from "@/lib/brainstorm/contentPillars";
import { LoadingIndicator } from "@/components/shell/LoadingIndicator";

interface BrainstormBoardProps {
  briefing: ContentBriefing | null;
  ideas: BrainstormIdea[];
  onIdeasChange: (ideas: BrainstormIdea[]) => void;
  onContinue?: () => void;
  loading?: boolean;
}

const PILLARS: ContentPillar[] = ["attention", "personal", "value"];

function newEmptyIdea(pillar: ContentPillar): BrainstormIdea {
  return {
    id: `manual-${Date.now()}-${pillar}`,
    pillar,
    title: "Neue Idee",
    hook: "",
    superhook: "",
    format: "",
    status: "idee",
  };
}

export function BrainstormBoard({
  briefing,
  ideas,
  onIdeasChange,
  onContinue,
  loading: externalLoading,
}: BrainstormBoardProps) {
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const generate = async () => {
    if (!briefing) return;
    setLoading(true);
    try {
      const res = await fetch("/api/brainstorm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ briefing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onIdeasChange([...ideas, ...(data.ideas ?? [])]);
    } finally {
      setLoading(false);
    }
  };

  const updateIdea = (id: string, patch: Partial<BrainstormIdea>) => {
    onIdeasChange(
      ideas.map((i) => (i.id === id ? { ...i, ...patch } : i))
    );
  };

  const removeIdea = (id: string) => {
    onIdeasChange(ideas.filter((i) => i.id !== id));
  };

  const byPillar = (p: ContentPillar) => ideas.filter((i) => i.pillar === p);

  const busy = loading || externalLoading;

  return (
    <section className="space-y-4">
      {loading && !externalLoading && (
        <LoadingIndicator taskId="brainstorm" />
      )}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Content Brainstorm</h2>
          <p className="text-sm opacity-75 max-w-2xl">
            Attention · Personal · Value — Ideen sammeln, SuperHook setzen, Status
            wie im Content Planner (Idee → Entwurf → Freigegeben).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy || !briefing}
            onClick={() => generate()}
            className="rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-[var(--surface)]"
          >
            {busy ? "Generiere…" : "Ideen aus Briefing generieren"}
          </button>
          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Weiter zur Research
            </button>
          )}
        </div>
      </div>

      <article className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2">
        <h3 className="font-semibold">{SUPERHOOK_COPY.title}</h3>
        <p className="text-sm opacity-90">{SUPERHOOK_COPY.kurz}</p>
        <div className="grid sm:grid-cols-2 gap-2 text-sm mt-2">
          <div className="rounded-lg border p-2 bg-background/50">
            <span className="text-xs font-medium text-[var(--muted)]">Hook</span>
            <p className="mt-1">{SUPERHOOK_COPY.beispielHook}</p>
          </div>
          <div className="rounded-lg border p-2 bg-background/50">
            <span className="text-xs font-medium text-[var(--muted)]">SuperHook</span>
            <p className="mt-1">{SUPERHOOK_COPY.beispielSuperhook}</p>
          </div>
        </div>
      </article>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {PILLARS.map((pillar) => {
          const meta = PILLAR_META[pillar];
          const styles = PILLAR_COLUMN_CLASS[pillar];
          const columnIdeas = byPillar(pillar);
          return (
            <div
              key={pillar}
              className={`rounded-xl border flex flex-col min-h-[280px] ${styles.column}`}
            >
              <header
                className={`p-4 border-b space-y-1.5 ${styles.headerBorder}`}
              >
                <h3 className={`font-semibold text-sm ${styles.headerTitle}`}>
                  {meta.title}
                </h3>
                <p className="text-[11px] opacity-70">{meta.subtitle}</p>
                <p className="text-xs">
                  <strong>Ziel:</strong> <em>{meta.ziel}</em>
                </p>
                <ul className="text-[10px] opacity-65 list-disc pl-3 space-y-0.5 mt-1">
                  {meta.formate.slice(0, 3).map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </header>
              <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[420px]">
                {columnIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className={`rounded-lg border p-2 text-xs space-y-2 ${STATUS_STYLES[idea.status]}`}
                  >
                    <div className="flex gap-1 flex-wrap">
                      {(Object.keys(STATUS_LABELS) as BrainstormStatus[]).map(
                        (st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => updateIdea(idea.id, { status: st })}
                            className={`rounded px-2 py-0.5 text-[10px] ${
                              idea.status === st
                                ? "bg-white/20 font-bold ring-1 ring-white/30"
                                : "opacity-60 hover:opacity-100"
                            }`}
                          >
                            {STATUS_LABELS[st]}
                          </button>
                        )
                      )}
                    </div>
                    <button
                      type="button"
                      className="w-full text-left font-medium text-sm"
                      onClick={() =>
                        setExpandedId(expandedId === idea.id ? null : idea.id)
                      }
                    >
                      {idea.title}
                    </button>
                    {expandedId === idea.id && (
                      <div className="space-y-1">
                        <input
                          className="w-full rounded border px-1 py-0.5 bg-transparent"
                          value={idea.title}
                          onChange={(e) =>
                            updateIdea(idea.id, { title: e.target.value })
                          }
                          placeholder="Titel"
                        />
                        <textarea
                          className="w-full rounded border px-1 py-0.5 bg-transparent min-h-[40px]"
                          value={idea.hook}
                          onChange={(e) =>
                            updateIdea(idea.id, { hook: e.target.value })
                          }
                          placeholder="Hook"
                        />
                        <textarea
                          className="w-full rounded border px-1 py-0.5 bg-transparent min-h-[40px]"
                          value={idea.superhook}
                          onChange={(e) =>
                            updateIdea(idea.id, { superhook: e.target.value })
                          }
                          placeholder="SuperHook"
                        />
                        <input
                          className="w-full rounded border px-1 py-0.5 bg-transparent"
                          value={idea.format}
                          onChange={(e) =>
                            updateIdea(idea.id, { format: e.target.value })
                          }
                          placeholder="Format"
                        />
                        <button
                          type="button"
                          className="text-[10px] text-[var(--muted)] underline hover:text-[var(--foreground)]"
                          onClick={() => removeIdea(idea.id)}
                        >
                          Entfernen
                        </button>
                      </div>
                    )}
                    {expandedId !== idea.id && idea.hook && (
                      <p className="opacity-80 line-clamp-2">{idea.hook}</p>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onIdeasChange([...ideas, newEmptyIdea(pillar)])}
                  className="w-full rounded-lg border border-dashed py-2 text-[11px] opacity-70 hover:opacity-100"
                >
                  + Idee hinzufügen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[10px] opacity-50 text-center">
        Content Planner · Status-Buttons nutzen · Freigegebene Ideen fließen in Research & Plan ein
      </p>
    </section>
  );
}
