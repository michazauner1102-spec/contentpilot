"use client";

import { useRef, useState } from "react";
import {
  importExternalSchedule,
  SAMPLE_BUFFER_CSV,
  SAMPLE_HOOTSUITE_CSV,
  type ImportScheduleResult,
  type ScheduleImportSource,
} from "@/lib/plan/importExternalSchedule";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/lib/ui/theme";
import { downloadTextFile } from "@/lib/export/downloadClient";

const SOURCE_LABEL: Record<ScheduleImportSource, string> = {
  buffer: "Buffer",
  hootsuite: "Hootsuite",
  contentpilot: "ContentPilot",
  generic: "JSON/CSV",
  unknown: "Extern",
};

interface PlanImportPanelProps {
  refMonth?: string;
  hasExistingPlan?: boolean;
  loading?: boolean;
  onImport: (result: ImportScheduleResult) => void;
  onLogged?: (message: string) => void;
}

export function PlanImportPanel({
  refMonth,
  hasExistingPlan,
  loading,
  onImport,
  onLogged,
}: PlanImportPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<ImportScheduleResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const runParse = (content: string, fileName?: string) => {
    setError(null);
    const local = importExternalSchedule(content, { refMonth, fileName });
    if (local.importedCount === 0) {
      setPreview(null);
      setError(local.warnings[0] ?? "Import konnte nicht gelesen werden.");
      return;
    }
    setPreview(local);
  };

  const readFile = async (file: File) => {
    const content = await file.text();
    setText(content);
    runParse(content, file.name);
  };

  const confirmImport = async () => {
    const content = text.trim();
    if (!content && !preview) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/plan/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, refMonth }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import fehlgeschlagen");
      const result = data.result as ImportScheduleResult;
      setPreview(result);
      onImport(result);
      onLogged?.(
        `${result.importedCount} Posts aus ${SOURCE_LABEL[result.source]} — Kalender ersetzt`
      );
    } catch (e) {
      if (content) {
        const fallback = importExternalSchedule(content, { refMonth });
        if (fallback.importedCount > 0) {
          onImport(fallback);
          onLogged?.(`${fallback.importedCount} Posts lokal importiert`);
          setPreview(fallback);
        } else {
          setError(e instanceof Error ? e.message : "Import fehlgeschlagen");
        }
      } else {
        setError(e instanceof Error ? e.message : "Import fehlgeschlagen");
      }
    } finally {
      setBusy(false);
    }
  };

  const loadSample = (sample: string) => {
    setText(sample);
    runParse(sample, "sample.csv");
  };

  return (
    <section className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div>
        <h2 className="font-semibold">Plan importieren (Buffer / Hootsuite)</h2>
        <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">
          CSV- oder JSON-Export aus Scheduling-Tools hochladen — ersetzt den
          KI-30-Tage-Plan im Kalender. Danach kannst du weiter Skripte,
          To-dos und Loop wie gewohnt nutzen.
        </p>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".csv,.json,text/csv,application/json"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void readFile(f);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={loading || busy}
          onClick={() => fileRef.current?.click()}
        >
          Datei wählen (.csv / .json)
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={loading || busy}
          onClick={() => loadSample(SAMPLE_BUFFER_CSV)}
        >
          Buffer-Beispiel
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={loading || busy}
          onClick={() => loadSample(SAMPLE_HOOTSUITE_CSV)}
        >
          Hootsuite-Beispiel
        </button>
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={loading || busy}
          onClick={() =>
            downloadTextFile(
              SAMPLE_BUFFER_CSV,
              "contentpilot-import-vorlage-buffer.csv",
              "text/csv;charset=utf-8"
            )
          }
        >
          Vorlage CSV
        </button>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Oder Inhalt einfügen</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          placeholder="Buffer: Spalten Text, Scheduled At, Channel …&#10;Hootsuite: Date, Time, Message, Social Network Profiles …"
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm font-mono resize-y min-h-[100px]"
          disabled={loading || busy}
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={BTN_SECONDARY}
          disabled={!text.trim() || loading || busy}
          onClick={() => runParse(text)}
        >
          Vorschau
        </button>
        <button
          type="button"
          className={BTN_PRIMARY}
          disabled={(!text.trim() && !preview) || loading || busy}
          onClick={() => void confirmImport()}
        >
          {busy ? "Import …" : hasExistingPlan ? "Kalender ersetzen" : "Als Plan übernehmen"}
        </button>
      </div>

      {hasExistingPlan && (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          Achtung: Der aktuelle KI-Plan wird vollständig durch die importierten
          Posts ersetzt (nur belegte Kalendertage sind klickbar).
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}

      {preview && preview.importedCount > 0 && (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3 space-y-2 text-sm">
          <p className="font-medium">
            Vorschau: {preview.importedCount} Posts · Quelle{" "}
            {SOURCE_LABEL[preview.source]}
            {preview.monat ? ` · ${preview.monat}` : ""}
          </p>
          <ul className="space-y-1 max-h-40 overflow-y-auto text-[var(--muted)]">
            {preview.plan.slice(0, 8).map((v) => (
              <li key={v.id}>
                Tag {v.postingDay}: {v.title.slice(0, 70)}
                {v.title.length > 70 ? "…" : ""} ({v.platform})
              </li>
            ))}
            {preview.plan.length > 8 && (
              <li>… und {preview.plan.length - 8} weitere</li>
            )}
          </ul>
          {preview.warnings.length > 0 && (
            <ul className="text-xs text-[var(--muted)] list-disc pl-4">
              {preview.warnings.slice(0, 4).map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
