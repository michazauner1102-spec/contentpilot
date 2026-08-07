"use client";

import { useState } from "react";
import {
  buildExportJson,
  buildExportMarkdown,
  buildExportPlainText,
  buildShootDayExport,
  exportFilename,
  type ContentExportBundle,
} from "@/lib/export/buildExport";
import { copyToClipboard, downloadTextFile } from "@/lib/export/downloadClient";
import type {
  ContentBriefing,
  ProductionGuide,
  ProgressEntry,
  ResearchResult,
  Zyklus,
  CreatorReferenceSuggestion,
} from "@/lib/types";
import type { BrainstormIdea } from "@/lib/brainstorm/contentPillars";
import { BTN_ACCENT, BTN_SECONDARY } from "@/lib/ui/theme";

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

  if (!briefing || !zyklus) return null;

  const b = bundle();
  const scriptsReady = zyklus.plan.filter((v) =>
    Boolean(v.skript?.body?.trim())
  ).length;

  return (
    <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 space-y-4">
      <div>
        <h2 className="font-semibold">Exportieren</h2>
        <p className="text-sm text-[var(--muted)] mt-1">
          Vollständiger Plan inkl. Skripte, Grafiken, Dreh-Anleitung und
          Produktions-Checkliste. {scriptsReady}/{zyklus.plan.length} Videos
          haben schon ein Skript.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <button
          type="button"
          className={`${BTN_ACCENT} text-sm`}
          onClick={async () => {
            const ok = await copyToClipboard(buildExportMarkdown(b));
            flash(
              ok
                ? "Vollständiger Markdown kopiert — in Notion einfügen"
                : "Kopieren fehlgeschlagen"
            );
          }}
        >
          Für Notion kopieren (komplett)
        </button>
        <button
          type="button"
          className={`${BTN_SECONDARY} text-sm`}
          onClick={() => {
            downloadTextFile(
              buildShootDayExport(b),
              exportFilename(briefing, "md").replace(
                ".md",
                "-drehtag.md"
              ),
              "text/markdown;charset=utf-8"
            );
            flash("Drehstag-Export heruntergeladen");
          }}
        >
          Nur Drehtag (.md)
        </button>
        <button
          type="button"
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-elevated)]"
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
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-elevated)]"
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
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-elevated)]"
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
          className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--surface-elevated)]"
          onClick={async () => {
            const ok = await copyToClipboard(buildExportPlainText(b));
            flash(ok ? "Text kopiert" : "Kopieren fehlgeschlagen");
          }}
        >
          Für Notizen kopieren
        </button>
      </div>

      {onNotionSync && (
        <div className="pt-2 border-t border-[var(--border)] space-y-2">
          <p className="text-xs text-[var(--muted)]">
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
              <a
                className="underline"
                href={notionUrl}
                target="_blank"
                rel="noreferrer"
              >
                In Notion öffnen
              </a>
            </p>
          )}
        </div>
      )}

      {toast && <p className="text-sm text-[var(--vertrauen)]">{toast}</p>}
    </section>
  );
}
