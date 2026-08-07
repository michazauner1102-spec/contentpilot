import type { ProductionGuide, VideoDetails } from "@/lib/types";

export type ProductionTodoKind = "skript" | "grafik" | "dreh" | "batch";

export interface ProductionTodo {
  id: string;
  kind: ProductionTodoKind;
  label: string;
  detail: string;
  /** Zugehörige Video-IDs (für Abhaken / Öffnen) */
  videoIds: string[];
  /** Optional: erster Tag zum Öffnen im Kalender */
  focusVideoId?: string;
  week?: number;
}

function hasScript(v: VideoDetails): boolean {
  return Boolean(v.skript?.body?.trim() || v.skript?.hook?.trim());
}

function hasGrafik(v: VideoDetails): boolean {
  return Boolean(v.grafikVorschlag?.trim());
}

function wocheVonTag(day: number): number {
  return Math.min(4, Math.ceil(day / 7));
}

function pushGroupedOrIndividual(
  todos: ProductionTodo[],
  kind: "skript" | "grafik",
  missing: VideoDetails[],
  noun: string
): void {
  if (!missing.length) return;

  // Wenige offene Punkte einzeln — sonst Wochen-Batches, kein Eintrag pro Tag.
  if (missing.length <= 4) {
    for (const v of missing) {
      todos.push({
        id: `${kind}:${v.id}`,
        kind,
        label: `${noun} · Tag ${v.postingDay}`,
        detail: v.title,
        videoIds: [v.id],
        focusVideoId: v.id,
        week: wocheVonTag(v.postingDay),
      });
    }
    return;
  }

  for (let woche = 1; woche <= 4; woche++) {
    const group = missing.filter((v) => wocheVonTag(v.postingDay) === woche);
    if (!group.length) continue;
    const days = group.map((v) => v.postingDay);
    todos.push({
      id: `${kind}:woche-${woche}`,
      kind,
      label: `${noun} · Woche ${woche}`,
      detail: `${group.length} offen (Tag ${days[0]}–${days[days.length - 1]}) — im Kalender oder „Alle Skripte generieren“`,
      videoIds: group.map((v) => v.id),
      focusVideoId: group[0].id,
      week: woche,
    });
  }
}

/**
 * Echte Produktions-To-dos — nicht „1 Todo pro Posting-Tag“.
 * Fokus: Skript-/Grafik-Batches, geplante Drehtage.
 */
export function buildProductionTodos(
  plan: VideoDetails[],
  productionGuide: ProductionGuide | null
): ProductionTodo[] {
  const sorted = [...plan].sort((a, b) => a.postingDay - b.postingDay);
  const todos: ProductionTodo[] = [];

  pushGroupedOrIndividual(
    todos,
    "skript",
    sorted.filter((v) => !hasScript(v)),
    "Skripte"
  );
  pushGroupedOrIndividual(
    todos,
    "grafik",
    sorted.filter((v) => !hasGrafik(v)),
    "Grafiken"
  );

  const wochenplan = productionGuide?.wochenplan ?? [];
  if (wochenplan.length) {
    for (const w of wochenplan) {
      const postVideos = sorted.filter((v) => w.postTage.includes(v.postingDay));
      if (!postVideos.length && !w.drehTage.length) continue;

      const drehLabel = w.drehTage.length
        ? w.drehTage.join(", ")
        : "Termin selbst festlegen";
      const titles = postVideos
        .slice(0, 4)
        .map((v) => `Tag ${v.postingDay}`)
        .join(", ");
      const more =
        postVideos.length > 4 ? ` (+${postVideos.length - 4})` : "";

      todos.push({
        id: `dreh:woche-${w.woche}`,
        kind: "dreh",
        label: `Dreh · Woche ${w.woche}`,
        detail: `Drehtermin ${drehLabel}${w.fokus ? ` · ${w.fokus}` : ""}${
          titles ? ` · Videos: ${titles}${more}` : ""
        }`,
        videoIds: postVideos.map((v) => v.id),
        focusVideoId: postVideos[0]?.id,
        week: w.woche,
      });
    }

    if (productionGuide?.batchingTipp?.trim()) {
      todos.push({
        id: "batch:tip",
        kind: "batch",
        label: "Batching-Hinweis",
        detail: productionGuide.batchingTipp.trim(),
        videoIds: [],
      });
    }
  } else if (sorted.length) {
    for (let woche = 1; woche <= 4; woche++) {
      const videos = sorted.filter((v) => wocheVonTag(v.postingDay) === woche);
      if (!videos.length) continue;
      todos.push({
        id: `dreh:woche-${woche}`,
        kind: "dreh",
        label: `Dreh-Batch · Woche ${woche}`,
        detail: `${videos.length} Videos (Tag ${videos[0].postingDay}–${
          videos[videos.length - 1].postingDay
        }) in einem Block drehen`,
        videoIds: videos.map((v) => v.id),
        focusVideoId: videos[0].id,
        week: woche,
      });
    }
  }

  return todos;
}

export const TODO_KIND_LABELS: Record<ProductionTodoKind, string> = {
  skript: "Skripte",
  grafik: "Grafiken",
  dreh: "Drehtage",
  batch: "Hinweise",
};
