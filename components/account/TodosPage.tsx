"use client";

import { RecordingTodoList } from "@/components/account/AccountView";
import type { ProductionGuide, VideoDetails, Zyklus } from "@/lib/types";

interface TodosPageProps {
  zyklus: Zyklus;
  productionGuide: ProductionGuide | null;
  onSelectDay: (v: VideoDetails) => void;
  recordedIds: string[];
  onToggleRecorded: (id: string) => void;
}

export function TodosPage({
  zyklus,
  productionGuide,
  onSelectDay,
  recordedIds,
  onToggleRecorded,
}: TodosPageProps) {
  return (
    <div className="space-y-8 max-w-2xl">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Aufnahme-To-dos</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Nach Wochen sortiert — abhaken und Eintrag öffnet Tag-Details im Kalender.
        </p>
      </header>
      <RecordingTodoList
        plan={zyklus.plan}
        productionGuide={productionGuide}
        onSelectDay={onSelectDay}
        recordedIds={recordedIds}
        onToggleRecorded={onToggleRecorded}
      />
      {productionGuide && (
        <details className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 text-sm">
          <summary className="cursor-pointer font-medium">
            Video gestalten, drehen & posten
          </summary>
          <ul className="list-disc pl-5 mt-4 space-y-1 text-[var(--muted)]">
            {productionGuide.videoGestaltung.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="mt-3">{productionGuide.drehRhythmus}</p>
          <ul className="list-disc pl-5 mt-2">
            {productionGuide.postingZeiten.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
