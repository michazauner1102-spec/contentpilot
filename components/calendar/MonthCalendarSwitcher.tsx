"use client";

import { formatMonthLabel } from "@/lib/calendar/multiMonth";
import type { Zyklus } from "@/lib/types";
import { BTN_PRIMARY, BTN_SECONDARY } from "@/lib/ui/theme";

interface MonthCalendarSwitcherProps {
  calendars: Zyklus[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onAddClone: () => void;
  onAddGenerate?: () => void;
  loading?: boolean;
  canGenerate?: boolean;
}

export function MonthCalendarSwitcher({
  calendars,
  activeId,
  onSelect,
  onAddClone,
  onAddGenerate,
  loading,
  canGenerate,
}: MonthCalendarSwitcherProps) {
  if (calendars.length === 0) return null;

  const sorted = [...calendars].sort((a, b) => a.monat.localeCompare(b.monat));

  return (
    <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">Monats-Kalender</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={BTN_SECONDARY}
            disabled={loading}
            onClick={onAddClone}
            title="Plan des aktuellen Monats in den nächsten freien Monat kopieren"
          >
            + Nächster Monat (Kopie)
          </button>
          {onAddGenerate && canGenerate && (
            <button
              type="button"
              className={BTN_PRIMARY}
              disabled={loading}
              onClick={onAddGenerate}
              title="Neuen 30-Tage-Plan für den nächsten Monat generieren"
            >
              + Nächster Monat (KI-Plan)
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {sorted.map((c) => {
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelect(c.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                active
                  ? "border-[var(--accent)] bg-[var(--surface-elevated)] font-medium"
                  : "border-[var(--border)] hover:bg-[var(--surface-elevated)]"
              }`}
            >
              {formatMonthLabel(c.monat)}
              <span className="ml-1.5 text-xs text-[var(--muted)]">
                ({c.plan.length} Tage)
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
