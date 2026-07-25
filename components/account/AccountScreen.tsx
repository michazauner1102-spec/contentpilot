"use client";

import {
  SpaciousCalendar,
  RecordingTodoList,
  DayDetailDrawer,
} from "@/components/account/AccountView";
import type { ProductionGuide, VideoDetails, Zyklus } from "@/lib/types";

interface AccountScreenProps {
  zyklus: Zyklus;
  productionGuide: ProductionGuide | null;
  selectedVideo: VideoDetails | null;
  selectedDay?: number;
  onSelectVideo: (v: VideoDetails) => void;
  onCloseDetail: () => void;
  onLoadDetail: (v: VideoDetails) => void;
  detailLoading: boolean;
  recordedIds: string[];
  onToggleRecorded: (id: string) => void;
  planVersion?: 1 | 2;
}

export function AccountScreen({
  zyklus,
  productionGuide,
  selectedVideo,
  selectedDay,
  onSelectVideo,
  onCloseDetail,
  onLoadDetail,
  detailLoading,
  recordedIds,
  onToggleRecorded,
  planVersion = 1,
}: AccountScreenProps) {
  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Kalender</h1>
          {planVersion === 2 && (
            <span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border border-[var(--accent)]/60 bg-[var(--surface-elevated)]">
              Plan v2 · aus Learnings
            </span>
          )}
        </div>
        <p className="text-sm text-[var(--muted)] mt-1">
          Tag anklicken — Thema, Skript und Vorschläge rechts.
        </p>
      </header>
      <div className="grid xl:grid-cols-[1fr_320px] gap-8">
        <SpaciousCalendar
          plan={zyklus.plan}
          onSelectDay={onSelectVideo}
          selectedDay={selectedDay}
        />
        <RecordingTodoList
          plan={zyklus.plan}
          productionGuide={productionGuide}
          onSelectDay={onSelectVideo}
          recordedIds={recordedIds}
          onToggleRecorded={onToggleRecorded}
        />
      </div>
      <DayDetailDrawer
        video={selectedVideo}
        onClose={onCloseDetail}
        onLoadDetail={onLoadDetail}
        loading={detailLoading}
      />
    </div>
  );
}

export function AccountEmpty({ onStart }: { onStart: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center space-y-4 max-w-lg">
      <h1 className="text-xl font-semibold">Noch kein Plan</h1>
      <p className="text-sm text-[var(--muted)] leading-relaxed">
        Starte das Setup: Nische, Fragen, Brainstorm und Research. Danach
        erscheint hier der Kalender und deine Aufnahme-To-dos.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="text-sm rounded-lg bg-[var(--surface-elevated)] border border-[var(--border)] px-5 py-2.5"
      >
        Plan-Setup starten
      </button>
    </div>
  );
}
