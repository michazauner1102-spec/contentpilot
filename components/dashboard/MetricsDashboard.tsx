"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { LoopAnalysisView } from "@/components/LoopAnalysisView";
import { PlanDiffSummaryView } from "@/components/PlanDiffSummary";
import {
  assignCarouselPlatforms,
  buildDemoPerformance,
  buildDemoZyklus,
} from "@/lib/demo/mockData";
import type { VideoWithInsights } from "@/lib/insights/types";
import type { PlanDiffSummary } from "@/lib/planDiff";
import type { Bereich, LoopAnalysisResult, Platform } from "@/lib/types";
import { BTN_ACCENT } from "@/lib/ui/theme";

interface MetricsDashboardProps {
  performance: VideoWithInsights[];
  onImportMock?: () => void;
  importing?: boolean;
  learnings?: LoopAnalysisResult | null;
  learningsMock?: boolean;
  planDiff?: PlanDiffSummary | null;
  planVersion?: 1 | 2;
  onGeneratePlanV2?: () => void;
  planV2Loading?: boolean;
}

const CAROUSEL_CHANNELS: {
  id: Platform | "weitere";
  label: string;
}[] = [
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "youtube", label: "YouTube" },
  { id: "tiktok", label: "TikTok" },
  { id: "weitere", label: "Weitere" },
];

const BEREICH_LABEL: Record<Bereich, string> = {
  reichweite: "Reichweite",
  vertrauen: "Vertrauen",
  conversion: "Conversion",
};

function sumMetrics(items: VideoWithInsights[]) {
  return items.reduce(
    (acc, i) => {
      const m = i.metrics;
      acc.views += m.views;
      acc.saves += m.saves;
      acc.shares += m.shares;
      acc.comments += m.comments;
      acc.linkClicks += m.linkClicks;
      acc.follows += m.follows;
      acc.profileVisits += m.profileVisits;
      acc.watchTimeSeconds += m.watchTimeSeconds;
      acc.completionSum += m.completionRate;
      return acc;
    },
    {
      views: 0,
      saves: 0,
      shares: 0,
      comments: 0,
      linkClicks: 0,
      follows: 0,
      profileVisits: 0,
      watchTimeSeconds: 0,
      completionSum: 0,
    }
  );
}

type CarouselCard = {
  id: Platform | "weitere";
  label: string;
  items: VideoWithInsights[];
  stats: ReturnType<typeof sumMetrics>;
};

function PlatformCarouselCard({
  label,
  items,
  stats,
  onOpen,
}: {
  label: string;
  items: VideoWithInsights[];
  stats: ReturnType<typeof sumMetrics>;
  onOpen: () => void;
}) {
  const avgCompletion =
    items.length > 0 ? stats.completionSum / items.length : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="snap-center shrink-0 w-[min(88vw,480px)] rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5 min-h-[320px] flex flex-col text-left transition-colors hover:border-[var(--accent)] hover:bg-[var(--surface-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
    >
      <header className="flex items-baseline justify-between gap-2 border-b border-[var(--border)] pb-3 w-full">
        <h2 className="text-lg font-semibold">{label}</h2>
        <span className="text-xs text-[var(--muted)]">
          {items.length} {items.length === 1 ? "Video" : "Videos"} · Report
        </span>
      </header>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--muted)] flex-1">
          Keine Videos auf dieser Plattform in den Demo-Daten.
        </p>
      ) : (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-4 text-sm flex-1 w-full">
          <div>
            <dt className="text-[var(--muted)] text-xs">Views</dt>
            <dd className="font-semibold tabular-nums text-base mt-0.5">
              {stats.views.toLocaleString()}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Watch-Zeit</dt>
            <dd className="font-semibold tabular-nums text-base mt-0.5">
              {Math.round(stats.watchTimeSeconds / 3600)} h
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Ø Completion</dt>
            <dd className="font-semibold tabular-nums text-base mt-0.5">
              {Math.round(avgCompletion * 100)} %
            </dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Saves</dt>
            <dd className="font-medium tabular-nums">{stats.saves.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Shares</dt>
            <dd className="font-medium tabular-nums">{stats.shares.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)] text-xs">Kommentare</dt>
            <dd className="font-medium tabular-nums">{stats.comments.toLocaleString()}</dd>
          </div>
        </dl>
      )}
      <p className="text-xs text-[var(--muted)] pt-1">Klicken für Großansicht & Report</p>
    </button>
  );
}

function buildCarouselCards(rows: VideoWithInsights[]): CarouselCard[] {
  const knownPlatforms = new Set<Platform>([
    "instagram",
    "linkedin",
    "youtube",
    "tiktok",
  ]);

  return CAROUSEL_CHANNELS.map((ch) => {
    const items =
      ch.id === "weitere"
        ? rows.filter((p) => !knownPlatforms.has(p.platform))
        : rows.filter((p) => p.platform === ch.id);
    return {
      id: ch.id,
      label: ch.label,
      items,
      stats: sumMetrics(items),
    };
  });
}

function mockReportInsights(label: string, stats: ReturnType<typeof sumMetrics>) {
  const engagement = stats.saves + stats.shares + stats.comments;
  return [
    `${label}: Engagement-Ratio (Saves+Shares+Comments) zu Views liegt bei ~${stats.views > 0 ? Math.round((engagement / stats.views) * 1000) / 10 : 0} % — typisch für Demo-Mix.`,
    stats.linkClicks > stats.follows
      ? "Link-Klicks überholen neue Follows → CTAs wirken stärker als reine Reichweite."
      : "Follower-Wachstum dominiert — Fokus auf Speichern & Shares für nächsten Zyklus.",
    "Tutorial- und Hook-Formate in Reichweite-Videos performen über Durchschnitt (Mock-Learning).",
  ];
}

function PlatformReportModal({
  card,
  onClose,
}: {
  card: CarouselCard;
  onClose: () => void;
}) {
  const { label, items, stats } = card;
  const avgCompletion =
    items.length > 0 ? stats.completionSum / items.length : 0;
  const topVideos = [...items]
    .sort((a, b) => b.metrics.views - a.metrics.views)
    .slice(0, 8);

  const bereichStats = useMemo(() => {
    const keys: Bereich[] = ["reichweite", "vertrauen", "conversion"];
    return keys.map((b) => {
      const group = items.filter((v) => v.bereich === b);
      const s = sumMetrics(group);
      return {
        bereich: b,
        count: group.length,
        views: s.views,
        avgViews: group.length ? Math.round(s.views / group.length) : 0,
      };
    });
  }, [items]);

  const insights = mockReportInsights(label, stats);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/70 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="platform-report-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-2xl my-6 sm:my-10"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border)] p-6 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
              Plattform-Report · Mock · 30 Tage
            </p>
            <h2 id="platform-report-title" className="text-2xl font-semibold mt-1">
              {label}
            </h2>
            <p className="text-sm text-[var(--muted)] mt-2">
              {items.length} Videos · aggregierte KPIs aus dem Content-Zyklus
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] shrink-0 px-3 py-1.5 rounded-lg border border-[var(--border)]"
          >
            Schließen (Esc)
          </button>
        </header>

        <div className="p-6 sm:p-8 space-y-8">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { k: "Views", v: stats.views.toLocaleString() },
              { k: "Watch-Zeit", v: `${Math.round(stats.watchTimeSeconds / 3600)} h` },
              { k: "Ø Completion", v: `${Math.round(avgCompletion * 100)} %` },
              { k: "Link-Klicks", v: stats.linkClicks.toLocaleString() },
              { k: "Saves", v: stats.saves.toLocaleString() },
              { k: "Shares", v: stats.shares.toLocaleString() },
              { k: "Follows", v: stats.follows.toLocaleString() },
              { k: "Profil-Besuche", v: stats.profileVisits.toLocaleString() },
            ].map((row) => (
              <div
                key={row.k}
                className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
              >
                <dt className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {row.k}
                </dt>
                <dd className="text-lg font-semibold tabular-nums mt-1">{row.v}</dd>
              </div>
            ))}
          </dl>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Mix nach Bereich</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              {bereichStats.map((b) => (
                <div
                  key={b.bereich}
                  className="rounded-xl border border-[var(--border)] p-4 text-sm"
                >
                  <p className="font-medium">{BEREICH_LABEL[b.bereich]}</p>
                  <p className="text-[var(--muted)] mt-1">
                    {b.count} Videos · Ø {b.avgViews.toLocaleString()} Views
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Top-Videos (Views)</h3>
            {topVideos.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">Keine Videos in dieser Gruppe.</p>
            ) : (
              <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] overflow-hidden">
                {topVideos.map((v, i) => (
                  <li
                    key={v.id}
                    className="flex items-center justify-between gap-4 px-4 py-3 text-sm bg-[var(--background)]/50"
                  >
                    <span className="truncate">
                      <span className="text-[var(--muted)] tabular-nums mr-2">
                        {i + 1}.
                      </span>
                      {v.title}
                    </span>
                    <span className="shrink-0 tabular-nums font-medium">
                      {v.metrics.views.toLocaleString()} Views
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-medium">Insights (Demo)</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--muted)] leading-relaxed">
              {insights.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

export function MetricsDashboard({
  performance,
  onImportMock,
  importing,
  learnings,
  learningsMock,
  planDiff,
  planVersion,
  onGeneratePlanV2,
  planV2Loading,
}: MetricsDashboardProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [reportCard, setReportCard] = useState<CarouselCard | null>(null);

  const displayRows = useMemo(() => {
    const base =
      performance.length > 0
        ? performance
        : buildDemoPerformance(buildDemoZyklus(1));
    return assignCarouselPlatforms(base);
  }, [performance]);

  const totals = sumMetrics(displayRows);
  const avgCompletion =
    displayRows.length > 0 ? totals.completionSum / displayRows.length : 0;

  const kpiBar = [
    { label: "Videos gesamt", value: String(displayRows.length) },
    { label: "Views", value: totals.views.toLocaleString() },
    { label: "Watch-Zeit", value: `${Math.round(totals.watchTimeSeconds / 3600)} h` },
    { label: "Ø Completion", value: `${Math.round(avgCompletion * 100)} %` },
    { label: "Saves", value: totals.saves.toLocaleString() },
    { label: "Link-Klicks", value: totals.linkClicks.toLocaleString() },
    { label: "Follows", value: totals.follows.toLocaleString() },
  ];

  const carouselCards = useMemo(
    () => buildCarouselCards(displayRows),
    [displayRows]
  );

  const hasLivePerformance = performance.length > 0;

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    let hover = false;
    let pauseUntil = 0;
    const bumpPause = () => {
      pauseUntil = Date.now() + 3500;
    };

    el.addEventListener("wheel", bumpPause, { passive: true });
    el.addEventListener("pointerdown", bumpPause);
    el.addEventListener("scroll", bumpPause);
    el.addEventListener("touchstart", bumpPause, { passive: true });

    const onEnter = () => {
      hover = true;
    };
    const onLeave = () => {
      hover = false;
    };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);

    let raf = 0;
    const tick = () => {
      const max = el.scrollWidth - el.clientWidth;
      if (max > 0 && !hover && Date.now() > pauseUntil) {
        el.scrollLeft += 0.4;
        if (el.scrollLeft >= max - 2) el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("wheel", bumpPause);
      el.removeEventListener("pointerdown", bumpPause);
      el.removeEventListener("scroll", bumpPause);
      el.removeEventListener("touchstart", bumpPause);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [carouselCards]);

  return (
    <div className="space-y-8 w-full overflow-x-hidden">
      {reportCard && (
        <PlatformReportModal card={reportCard} onClose={() => setReportCard(null)} />
      )}

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <span className="text-[10px] uppercase tracking-wide rounded px-1.5 py-0.5 border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--muted)]">
            Mock-Daten
          </span>
        </div>
        <p className="text-sm text-[var(--muted)] max-w-2xl">
          KPIs oben, Plattform-Karussell scrollbar (ohne Leiste) — Karte anklicken
          für den Report.
        </p>
        {onImportMock && !hasLivePerformance && (
          <button
            type="button"
            disabled={importing}
            onClick={onImportMock}
            className="text-sm rounded-lg border border-[var(--border)] px-4 py-2 disabled:opacity-50"
          >
            {importing ? "Import…" : "Plan-Metriken neu laden"}
          </button>
        )}
      </header>

      <section
        className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
        aria-label="Wichtigste KPIs"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7">
          {kpiBar.map((k, i) => (
            <div
              key={k.label}
              className={`px-5 py-4 ${
                i < kpiBar.length - 1
                  ? "border-b sm:border-b-0 sm:border-r border-[var(--border)]"
                  : ""
              }`}
            >
              <p className="text-[10px] uppercase tracking-wider text-[var(--muted)] whitespace-nowrap">
                {k.label}
              </p>
              <p className="text-xl font-semibold tabular-nums mt-1 whitespace-nowrap">
                {k.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-[var(--muted)]">
          Plattformen — wischen / scrollen
        </h2>
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar -mx-1 px-1 pb-1 cursor-grab active:cursor-grabbing"
        >
          {carouselCards.map((card) => (
            <PlatformCarouselCard
              key={card.id}
              label={card.label}
              items={card.items}
              stats={card.stats}
              onOpen={() => setReportCard(card)}
            />
          ))}
        </div>
      </section>

      <div className="grid xl:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-8">
          {onGeneratePlanV2 && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
              <h2 className="text-sm font-medium">Der Loop schließt sich</h2>
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Aus den Metriken werden Learnings je Bereich — daraus entsteht Plan
                v2, der direkt im Kalender landet.
              </p>
              <button
                type="button"
                disabled={planV2Loading || !hasLivePerformance}
                onClick={onGeneratePlanV2}
                className={BTN_ACCENT}
              >
                {planV2Loading
                  ? "Learnings & Plan v2…"
                  : "Plan v2 aus Learnings generieren"}
              </button>
            </section>
          )}
          <LoopAnalysisView learnings={learnings ?? null} mock={learningsMock} />
        </div>
        <PlanDiffSummaryView diff={planDiff ?? null} activeVersion={planVersion} />
      </div>
    </div>
  );
}
