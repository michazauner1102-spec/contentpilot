"use client";

import { useState } from "react";
import {
  RESEARCH_FOCUS_OPTIONS,
  type ResearchFocusId,
  type ResearchThemenBlock,
} from "@/lib/research/themenBlocks";
import type { ResearchResult } from "@/lib/types";
import { BereichBadge, bereichBorder } from "@/components/PipelineStrip";
import { ResearchProviderPicker } from "@/components/research/ResearchProviderPicker";
import { BTN_ACCENT } from "@/lib/ui/theme";
import type { WebResearchProviderId } from "@/lib/research/webResearchProviders";

interface ResearchBoardProps {
  research: ResearchResult & { researchNotizen?: string };
  themen: ResearchThemenBlock[];
  cycle: number;
  loading: boolean;
  feedback: string;
  onFeedbackChange: (v: string) => void;
  onRerun: () => void;
  onApprove: () => void;
  focus: ResearchFocusId[];
  onFocusChange: (f: ResearchFocusId[]) => void;
  onStartResearch: () => void;
  showStart?: boolean;
  webProvider: WebResearchProviderId;
  onWebProviderChange: (id: WebResearchProviderId) => void;
  webSourceLabel?: string | null;
}

export function ResearchBoard({
  research,
  themen,
  cycle,
  loading,
  feedback,
  onFeedbackChange,
  onRerun,
  onApprove,
  focus,
  onFocusChange,
  onStartResearch,
  showStart,
  webProvider,
  onWebProviderChange,
  webSourceLabel,
}: ResearchBoardProps) {
  const [tab, setTab] = useState<"themen" | "rohdaten">("themen");

  const toggleFocus = (id: ResearchFocusId) => {
    onFocusChange(
      focus.includes(id) ? focus.filter((f) => f !== id) : [...focus, id]
    );
  };

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-3">
        <h2 className="font-semibold">Research-Onboarding</h2>
        <p className="text-sm opacity-80">
          Wähle, worauf die Recherche fokussieren soll — mehrere möglich.
        </p>
        <div className="flex flex-wrap gap-2">
          {RESEARCH_FOCUS_OPTIONS.map((opt) => {
            const on = focus.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleFocus(opt.id)}
                className={`rounded-lg border px-3 py-2 text-left text-xs max-w-[160px] transition ${
                  on
                    ? "border-[var(--accent)] bg-[var(--surface-elevated)]"
                    : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
                }`}
              >
                <span className="font-medium block">{opt.label}</span>
                <span className="opacity-70">{opt.detail}</span>
              </button>
            );
          })}
        </div>
        <ResearchProviderPicker
          value={webProvider}
          onChange={onWebProviderChange}
          lastSourceLabel={webSourceLabel}
          disabled={loading}
        />
        {showStart && (
          <button
            type="button"
            disabled={loading || focus.length === 0}
            onClick={onStartResearch}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm disabled:opacity-50 hover:bg-[var(--surface)]"
          >
            {loading ? "Recherchiere…" : "Recherche mit Fokus starten"}
          </button>
        )}
      </div>

      {!showStart && (
        <>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-semibold">Research · Zyklus {cycle}</h2>
            <div className="flex rounded-lg border border-[var(--border)] p-0.5 text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded-md ${tab === "themen" ? "bg-[var(--surface-elevated)]" : "text-[var(--muted)]"}`}
                onClick={() => setTab("themen")}
              >
                Themen-Säulen
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded-md ${tab === "rohdaten" ? "bg-[var(--surface-elevated)]" : "text-[var(--muted)]"}`}
                onClick={() => setTab("rohdaten")}
              >
                Rohdaten
              </button>
            </div>
          </div>

          {tab === "themen" && (
            <div className="grid md:grid-cols-3 gap-3">
              {themen.map((block) => (
                <article
                  key={block.bereich}
                  className={`rounded-xl border bg-background p-3 space-y-2 ${bereichBorder(block.bereich)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{block.titel}</h3>
                    <BereichBadge bereich={block.bereich} />
                  </div>
                  <p className="text-xs opacity-75">{block.beschreibung}</p>
                  <div>
                    <p className="text-[10px] uppercase opacity-60 mb-1">Themen</p>
                    <ul className="text-xs space-y-1">
                      {block.themen.map((t) => (
                        <li key={t} className="rounded bg-[var(--surface-elevated)] px-2 py-1">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase opacity-60 mb-1">Content-Ideen</p>
                    <ul className="text-xs list-disc pl-4 opacity-90">
                      {block.contentIdeen.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === "rohdaten" && (
            <div className="rounded-xl border p-4 text-sm space-y-2">
              <p>{research.zielgruppe}</p>
              <p className="opacity-90">{research.painPoints.join(" · ")}</p>
              <p className="text-xs">Hooks: {research.hookMuster.join(" · ")}</p>
              {research.researchNotizen && (
                <p className="text-xs italic opacity-70">{research.researchNotizen}</p>
              )}
            </div>
          )}

          <div className="rounded-xl border p-4 space-y-3 border-dashed">
            <p className="text-sm font-medium">Human-in-the-Loop</p>
            <textarea
              className="w-full rounded-lg border px-3 py-2 min-h-[72px] bg-transparent text-sm"
              placeholder="Korrektur: z. B. mehr Conversion-Themen, weniger allgemeine Hooks …"
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading}
                onClick={onRerun}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Erneut recherchieren
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onApprove}
                className={BTN_ACCENT}
              >
                Freigeben → Plan & Kalender
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
