"use client";

import { useMemo } from "react";
import type { ProductionGuide, VideoDetails } from "@/lib/types";
import { BEREICH_LABELS } from "@/lib/types";
import { bereichDotClass, bereichMutedClass } from "@/lib/ui/theme";

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

interface SpaciousCalendarProps {
  plan: VideoDetails[];
  onSelectDay: (video: VideoDetails) => void;
  selectedDay?: number;
}

export function SpaciousCalendar({
  plan,
  onSelectDay,
  selectedDay,
}: SpaciousCalendarProps) {
  const byDay = useMemo(() => {
    const m = new Map<number, VideoDetails>();
    for (const v of plan) m.set(v.postingDay, v);
    return m;
  }, [plan]);

  const cells = Array.from({ length: 35 }, (_, i) => i + 1);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      <div className="grid grid-cols-7 border-b border-[var(--border)]">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="py-3 text-center text-xs text-[var(--muted)] font-medium"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 auto-rows-[minmax(88px,1fr)] gap-px bg-[var(--border)]">
        {cells.map((day) => {
          const v = byDay.get(day);
          const selected = selectedDay === day;
          if (day > 30) {
            return (
              <div
                key={day}
                className="min-h-[88px] bg-[var(--background)]"
                aria-hidden
              />
            );
          }
          return (
            <button
              key={day}
              type="button"
              disabled={!v}
              onClick={() => v && onSelectDay(v)}
              className={`relative min-h-[88px] p-3 text-left bg-[var(--background)] transition hover:bg-[var(--surface-elevated)] disabled:cursor-default disabled:opacity-40 ${
                v ? `border-t-2 ${bereichMutedClass(v.bereich)}` : ""
              } ${selected ? "ring-1 ring-[var(--accent)] ring-inset" : ""}`}
            >
              <span className="absolute top-2 right-3 text-sm text-[var(--muted)]">
                {day}
              </span>
              {v && (
                <>
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full mt-1 ${bereichDotClass(v.bereich)}`}
                  />
                  <p className="text-xs mt-2 line-clamp-2 leading-relaxed pr-4">
                    {v.title}
                  </p>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface RecordingTodoListProps {
  plan: VideoDetails[];
  productionGuide: ProductionGuide | null;
  onSelectDay: (video: VideoDetails) => void;
  recordedIds: string[];
  onToggleRecorded: (id: string) => void;
}

/** Woche 1 = Tag 1–7, Woche 2 = Tag 8–14 usw. */
function wocheVonTag(day: number): number {
  return Math.min(4, Math.ceil(day / 7));
}

export function RecordingTodoList({
  plan,
  productionGuide,
  onSelectDay,
  recordedIds,
  onToggleRecorded,
}: RecordingTodoListProps) {
  const wochen = useMemo(() => {
    const groups = new Map<number, VideoDetails[]>();
    for (const v of [...plan].sort((a, b) => a.postingDay - b.postingDay)) {
      const w = wocheVonTag(v.postingDay);
      groups.set(w, [...(groups.get(w) ?? []), v]);
    }
    return [...groups.entries()].map(([woche, videos]) => ({
      woche,
      videos,
      guide: productionGuide?.wochenplan.find((g) => g.woche === woche),
    }));
  }, [plan, productionGuide]);

  const offen = plan.length - recordedIds.length;

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-5">
      <div>
        <h2 className="text-sm font-medium">Aufnahme-To-dos</h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          {plan.length === 0
            ? "Nach Plan-Erstellung erscheinen Dreh-Tage hier."
            : `${offen} von ${plan.length} Videos offen · Klick öffnet Skript`}
        </p>
      </div>

      {productionGuide?.batchingTipp && (
        <p className="text-xs text-[var(--muted)] leading-relaxed border-l-2 border-[var(--border)] pl-3">
          {productionGuide.batchingTipp}
        </p>
      )}

      <div className="space-y-5 max-h-[560px] overflow-y-auto pr-1">
        {wochen.map(({ woche, videos, guide }) => (
          <section key={woche} className="space-y-2">
            <header>
              <h3 className="text-xs font-medium">
                Woche {woche}
                {guide?.drehTage.length ? ` · Dreh ${guide.drehTage.join(", ")}` : ""}
              </h3>
              {guide?.fokus && (
                <p className="text-[11px] text-[var(--muted)]">{guide.fokus}</p>
              )}
            </header>
            <ul className="space-y-1">
              {videos.map((v) => {
                const done = recordedIds.includes(v.id);
                return (
                  <li key={v.id} className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={done}
                      onChange={() => onToggleRecorded(v.id)}
                      aria-label={`Tag ${v.postingDay} aufgenommen`}
                      className="mt-1 accent-[var(--accent)] shrink-0"
                    />
                    <button
                      type="button"
                      onClick={() => onSelectDay(v)}
                      className={`flex-1 text-left rounded-md px-2 py-1 -mx-1 hover:bg-[var(--surface-elevated)] ${
                        done ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${bereichDotClass(v.bereich)}`}
                        />
                        <span className="text-xs font-medium">
                          Tag {v.postingDay}
                        </span>
                      </span>
                      <span className="block text-[11px] text-[var(--muted)] leading-relaxed mt-0.5">
                        {v.title} · {BEREICH_LABELS[v.bereich]}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

interface DayDetailDrawerProps {
  video: VideoDetails | null;
  onClose: () => void;
  onLoadDetail?: (video: VideoDetails) => void;
  loading?: boolean;
}

export function DayDetailDrawer({
  video,
  onClose,
  onLoadDetail,
  loading,
}: DayDetailDrawerProps) {
  if (!video) return null;

  const hasScript = Boolean(video.skript?.hook);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-[var(--surface)] border-l border-[var(--border)] overflow-y-auto p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-xs text-[var(--muted)]">
              Tag {video.postingDay} · {BEREICH_LABELS[video.bereich]}
            </p>
            <h2 className="text-xl font-semibold mt-1 leading-snug">
              {video.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--muted)] hover:text-[var(--foreground)] text-sm"
          >
            Schließen
          </button>
        </div>

        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-[var(--muted)]">
            Thema
          </h3>
          <p className="text-sm leading-relaxed">{video.hook}</p>
          <p className="text-sm text-[var(--muted)]">{video.begruendung}</p>
        </section>

        <section className="space-y-2">
          <h3 className="text-xs uppercase tracking-wider text-[var(--muted)]">
            Skript
          </h3>
          {!hasScript && onLoadDetail && (
            <button
              type="button"
              disabled={loading}
              onClick={() => onLoadDetail(video)}
              className="text-sm rounded-lg border border-[var(--border)] px-3 py-2 w-full"
            >
              {loading ? "Generiere…" : "Skript & Vorschläge laden"}
            </button>
          )}
          {hasScript && (
            <div className="space-y-3 text-sm leading-relaxed">
              <p>
                <span className="text-[var(--muted)]">Hook · </span>
                {video.skript.hook}
              </p>
              <p>
                <span className="text-[var(--muted)]">Body · </span>
                {video.skript.body}
              </p>
              <p>
                <span className="text-[var(--muted)]">CTA · </span>
                {video.skript.cta}
              </p>
            </div>
          )}
        </section>

        {(video.grafikVorschlag || video.referenzBegruendung) && (
          <section className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Vorschläge
            </h3>
            {video.grafikVorschlag && (
              <p className="text-sm">{video.grafikVorschlag}</p>
            )}
            {video.referenzBegruendung && (
              <p className="text-sm text-[var(--muted)]">
                Referenz: {video.referenzBegruendung}
              </p>
            )}
          </section>
        )}

        {video.drehAnleitung?.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Dreh
            </h3>
            <ul className="text-xs space-y-2 text-[var(--muted)]">
              {video.drehAnleitung.map((s, i) => (
                <li key={i}>
                  {s.setting} · {s.inhalt} ({s.ungefaehreDauerSekunden}s)
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
