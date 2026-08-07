"use client";

import { useMemo } from "react";
import {
  buildProductionTodos,
  TODO_KIND_LABELS,
  type ProductionTodo,
  type ProductionTodoKind,
} from "@/lib/todos/productionTodos";
import type { ProductionGuide, VideoDetails } from "@/lib/types";

interface ProductionTodoListProps {
  plan: VideoDetails[];
  productionGuide: ProductionGuide | null;
  onSelectDay: (video: VideoDetails) => void;
  doneIds: string[];
  onToggleDone: (id: string) => void;
}

const KIND_ORDER: ProductionTodoKind[] = ["dreh", "skript", "grafik", "batch"];

export function ProductionTodoList({
  plan,
  productionGuide,
  onSelectDay,
  doneIds,
  onToggleDone,
}: ProductionTodoListProps) {
  const todos = useMemo(
    () => buildProductionTodos(plan, productionGuide),
    [plan, productionGuide]
  );

  const byKind = useMemo(() => {
    const map = new Map<ProductionTodoKind, ProductionTodo[]>();
    for (const kind of KIND_ORDER) map.set(kind, []);
    for (const t of todos) {
      map.get(t.kind)?.push(t);
    }
    return KIND_ORDER.map((kind) => ({
      kind,
      items: map.get(kind) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [todos]);

  const offen = todos.filter((t) => t.kind !== "batch" && !doneIds.includes(t.id))
    .length;
  const actionable = todos.filter((t) => t.kind !== "batch").length;

  const videoById = useMemo(() => {
    const m = new Map(plan.map((v) => [v.id, v]));
    return m;
  }, [plan]);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-5">
      <div>
        <h2 className="text-sm font-medium">Produktions-To-dos</h2>
        <p className="text-xs text-[var(--muted)] mt-1">
          {plan.length === 0
            ? "Nach Plan-Freigabe erscheinen hier Drehtage, Skripte und Grafiken."
            : `${offen} offen · ${actionable} Aufgaben (kein Eintrag pro Posting-Tag)`}
        </p>
      </div>

      {byKind.length === 0 && (
        <p className="text-sm text-[var(--muted)]">
          Alles erledigt — Skripte und Grafiken sind da, Drehbatches abgehakt.
        </p>
      )}

      <div className="space-y-5 max-h-[640px] overflow-y-auto pr-1">
        {byKind.map(({ kind, items }) => (
          <section key={kind} className="space-y-2">
            <h3 className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {TODO_KIND_LABELS[kind]}
            </h3>
            <ul className="space-y-1">
              {items.map((t) => {
                const done = doneIds.includes(t.id);
                const focus = t.focusVideoId
                  ? videoById.get(t.focusVideoId)
                  : undefined;
                return (
                  <li key={t.id} className="flex items-start gap-2">
                    {t.kind !== "batch" ? (
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => onToggleDone(t.id)}
                        aria-label={t.label}
                        className="mt-1 accent-[var(--accent)] shrink-0"
                      />
                    ) : (
                      <span className="mt-1 w-3.5 shrink-0" aria-hidden />
                    )}
                    <button
                      type="button"
                      disabled={!focus}
                      onClick={() => focus && onSelectDay(focus)}
                      className={`flex-1 text-left rounded-md px-2 py-1.5 -mx-1 hover:bg-[var(--surface-elevated)] disabled:hover:bg-transparent ${
                        done ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <span className="block text-xs font-medium">{t.label}</span>
                      <span className="block text-[11px] text-[var(--muted)] leading-relaxed mt-0.5">
                        {t.detail}
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
