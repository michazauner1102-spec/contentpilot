"use client";

import { useState } from "react";
import {
  buildExportJson,
  buildExportMarkdown,
  buildExportPlainText,
  exportFilename,
  type ContentExportBundle,
} from "@/lib/export/buildExport";
import { copyToClipboard, downloadTextFile } from "@/lib/export/downloadClient";
import type { ContentBriefing, ProductionGuide, ProgressEntry, ResearchResult, Zyklus } from "@/lib/types";
import type { CreatorReferenceSuggestion } from "@/lib/types";

import type { BrainstormIdea } from "@/lib/brainstorm/contentPillars";

interface ExportPanelProps {
  briefing: ContentBriefing | null;
  creatorSuggestion: CreatorReferenceSuggestion | null;
  brainstormIdeas?: BrainstormIdea[];
  research: (ResearchResult & { researchNotizen?: string }) | null;
  researchCycle: number;
  zyklus: Zyklus | null;
  productionGuide: ProductionGuide | null;
  progressLog: ProgressEntry[];
  onNotionSync?: () => void;
  notionSyncLoading?: boolean;
  notionUrl?: string | null;
}

export function ExportPanel({
  briefing,
  creatorSuggestion,
  brainstormIdeas,
  research,
  researchCycle,
  zyklus,
  productionGuide,
  progressLog,
  onNotionSync,
  notionSyncLoading,
  notionUrl,
}: ExportPanelProps) {
  const [toast, setToast] = useState<string | null>(null);

  const bundle = (): ContentExportBundle => ({
    exportedAt: new Date().toISOString(),
    briefing,
    creatorSuggestion,
    brainstormIdeas,
    research,
    researchCycle,
    zyklus,
    productionGuide,
    progressLog,
  });

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const canExport = Boolean(briefing && zyklus);

  if (!canExport) return null;

  const b = bundle();

  return (
    <section className="rounded-xl border p-4 space-y-3">
      <div>
        <h2 className="font-semibold">Exportieren</h2>
        <p className="text-sm opacity-80 mt-1">
          Für Notion, Apple Notes, Obsidian, Google Docs: Markdown/JSON
          herunterladen oder in die Zwischenablage — in Notion einfach
          einfügen (Strg/Cmd+V).
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          onClick={() => {
            downloadTextFile(
              buildExportMarkdown(b),
              exportFilename(briefing, "md"),
              "text/markdown;charset=utf-8"
            );
            flash("Markdown heruntergeladen");
          }}
        >
          Markdown (.md)
        </button>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          onClick={() => {
            downloadTextFile(
              buildExportPlainText(b),
              exportFilename(briefing, "txt")
            );
            flash("Textdatei heruntergeladen");
          }}
        >
          Notizen (.txt)
        </button>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900"
          onClick={() => {
            downloadTextFile(
              buildExportJson(b),
              exportFilename(briefing, "json"),
              "application/json;charset=utf-8"
            );
            flash("JSON heruntergeladen");
          }}
        >
          JSON (Backup)
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--accent)]/50 bg-[var(--surface-elevated)] px-3 py-2 text-sm font-medium hover:bg-[var(--surface)]"
          onClick={async () => {
            const ok = await copyToClipboard(buildExportMarkdown(b));
            flash(ok ? "Markdown kopiert — in Notion einfügen" : "Kopieren fehlgeschlagen");
          }}
        >
          Für Notion kopieren
        </button>
        <button
          type="button"
          className="rounded-lg border px-3 py-2 text-sm font-medium"
          onClick={async () => {
            const ok = await copyToClipboard(buildExportPlainText(b));
            flash(ok ? "Text kopiert" : "Kopieren fehlgeschlagen");
          }}
        >
          Für Notizen kopieren
        </button>
      </div>

      {onNotionSync && (
        <div className="pt-2 border-t space-y-2">
          <p className="text-xs opacity-70">
            Optional: Direkt-Sync, wenn{" "}
            <code className="text-[11px]">NOTION_TOKEN</code> gesetzt ist.
          </p>
          <button
            type="button"
            disabled={notionSyncLoading}
            onClick={onNotionSync}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-sm disabled:opacity-50 hover:bg-[var(--surface)]"
          >
            {notionSyncLoading ? "Sync…" : "Direkt nach Notion syncen"}
          </button>
          {notionUrl && (
            <p className="text-sm">
              <a className="underline" href={notionUrl} target="_blank" rel="noreferrer">
                In Notion öffnen
              </a>
            </p>
          )}
        </div>
      )}

      {toast && (
        <p className="text-sm text-[var(--vertrauen)]">{toast}</p>
      )}
    </section>
  );
}
