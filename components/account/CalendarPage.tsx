"use client";

import {
  SpaciousCalendar,
  DayDetailDrawer,
} from "@/components/account/AccountView";
import type { VideoDetails, Zyklus } from "@/lib/types";

interface CalendarPageProps {
  zyklus: Zyklus;
  selectedVideo: VideoDetails | null;
  selectedDay?: number;
  onSelectVideo: (v: VideoDetails) => void;
  onCloseDetail: () => void;
  onLoadDetail: (
    v: VideoDetails,
    options?: { force?: boolean }
  ) => void;
  detailLoading: boolean;
  planVersion?: 1 | 2;
  importSourceLabel?: string | null;
}

export function CalendarPage({
  zyklus,
  selectedVideo,
  selectedDay,
  onSelectVideo,
  onCloseDetail,
  onLoadDetail,
  detailLoading,
  planVersion = 1,
  importSourceLabel,
}: CalendarPageProps) {
  return (
    <div className="space-y-8 w-full">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Kalender</h1>
          {planVersion === 2 && (
            <span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border border-[var(--accent)]/60 bg-[var(--surface-elevated)]">
              Plan v2 · aus Learnings
            </span>
          )}
          {importSourceLabel && planVersion !== 2 && (
            <span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border border-[var(--border)] bg-[var(--surface-elevated)]">
              Import · {importSourceLabel}
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--muted)] mt-1">
          Tag anklicken — Thema, Skript und Vorschläge im Drawer.
        </p>
      </header>
      <SpaciousCalendar
        plan={zyklus.plan}
        onSelectDay={onSelectVideo}
        selectedDay={selectedDay}
      />
      <DayDetailDrawer
        video={selectedVideo}
        onClose={onCloseDetail}
        onLoadDetail={onLoadDetail}
        loading={detailLoading}
      />
    </div>
  );
}
