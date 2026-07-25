"use client";

import {
  SpaciousCalendar,
  DayDetailDrawer,
} from "@/components/account/AccountView";
import { PlanImportPanel } from "@/components/plan/PlanImportPanel";
import { MonthCalendarSwitcher } from "@/components/calendar/MonthCalendarSwitcher";
import { formatMonthLabel } from "@/lib/calendar/multiMonth";
import type { ImportScheduleResult } from "@/lib/plan/importExternalSchedule";
import type { VideoDetails, Zyklus } from "@/lib/types";

interface CalendarPageProps {
  zyklus: Zyklus;
  calendars: Zyklus[];
  activeCalendarId: string | null;
  onSelectCalendar: (id: string) => void;
  onAddNextMonthClone: () => void;
  onAddNextMonthGenerate?: () => void;
  calendarActionLoading?: boolean;
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
  onImportSchedule?: (result: ImportScheduleResult) => void;
  onImportLog?: (message: string) => void;
}

export function CalendarPage({
  zyklus,
  calendars,
  activeCalendarId,
  onSelectCalendar,
  onAddNextMonthClone,
  onAddNextMonthGenerate,
  calendarActionLoading,
  selectedVideo,
  selectedDay,
  onSelectVideo,
  onCloseDetail,
  onLoadDetail,
  detailLoading,
  planVersion = 1,
  importSourceLabel,
  onImportSchedule,
  onImportLog,
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
          {formatMonthLabel(zyklus.monat)} — Tag anklicken für Drawer & Skript.
          Mehrere Monate unten anlegen oder wechseln.
        </p>
      </header>

      <MonthCalendarSwitcher
        calendars={calendars}
        activeId={activeCalendarId}
        onSelect={onSelectCalendar}
        onAddClone={onAddNextMonthClone}
        onAddGenerate={onAddNextMonthGenerate}
        loading={calendarActionLoading}
        canGenerate={Boolean(onAddNextMonthGenerate)}
      />

      {onImportSchedule && (
        <PlanImportPanel
          variant="calendar"
          refMonth={zyklus.monat}
          hasExistingPlan={zyklus.plan.length > 0}
          onImport={onImportSchedule}
          onLogged={onImportLog}
        />
      )}

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
