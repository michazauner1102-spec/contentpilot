"use client";

import { useEffect, useState } from "react";
import {
  formatLoadingEstimate,
  LOADING_TASKS,
  type LoadingTaskId,
} from "@/lib/ui/loadingTasks";

interface LoadingIndicatorProps {
  taskId: LoadingTaskId;
  /** Kleines Inline-Badge statt Vollbild-Overlay */
  inline?: boolean;
  /** Echter Fortschritt, wenn bekannt (z. B. „12 / 30 Videos") */
  progress?: { done: number; total: number } | null;
}

export function LoadingIndicator({
  taskId,
  inline,
  progress,
}: LoadingIndicatorProps) {
  const meta = LOADING_TASKS[taskId];
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setElapsed(0);
    const t = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [taskId]);

  const estimate = formatLoadingEstimate(meta.minSec, meta.maxSec);
  const overEstimate = elapsed > meta.maxSec;

  const body = (
    <>
      <div
        className="cp-spinner mx-auto shrink-0"
        role="status"
        aria-label={meta.label}
      />
      <p className="mt-4 text-sm font-semibold text-[var(--foreground)]">
        {meta.label}
      </p>
      <p className="mt-1 text-xs text-[var(--muted)]">{meta.hint}</p>
      {progress && progress.total > 0 && (
        <div className="mt-4 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-[var(--surface-elevated)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500"
              style={{
                width: `${Math.round((progress.done / progress.total) * 100)}%`,
              }}
            />
          </div>
          <p className="text-xs text-[var(--foreground)] tabular-nums">
            {progress.done} / {progress.total} Videos
          </p>
        </div>
      )}
      <p className="mt-3 text-xs text-[var(--muted-strong)] tabular-nums">
        Dauert {estimate}
        {elapsed > 0 && (
          <>
            {" "}
            · läuft seit <span className="text-[var(--foreground)]">{elapsed}s</span>
          </>
        )}
      </p>
      {overEstimate && (
        <p className="mt-2 text-[11px] text-[var(--muted)] leading-relaxed">
          Noch aktiv — bei Live-KI kann es etwas länger dauern.
        </p>
      )}
    </>
  );

  if (inline) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="cp-spinner shrink-0 scale-75" aria-hidden />
        <div className="text-left min-w-0">
          <p className="text-sm font-medium truncate">{meta.label}</p>
          <p className="text-xs text-[var(--muted)]">
            {estimate}
            {elapsed > 0 ? ` · ${elapsed}s` : ""}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[var(--overlay)] backdrop-blur-[2px]"
      role="alertdialog"
      aria-modal="true"
      aria-busy="true"
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-8 py-8 text-center shadow-lg [box-shadow:var(--shadow-modal)]">
        {body}
      </div>
    </div>
  );
}
