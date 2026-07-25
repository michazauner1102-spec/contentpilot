import type { VideoDetails, Zyklus } from "@/lib/types";
import { buildZyklusId } from "@/lib/planGenerator";

/** YYYY-MM + n Monate */
export function addMonthsToYm(ym: string, months: number): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 7);
  }
  const d = new Date(y, m - 1 + months, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function formatMonthLabel(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m) return ym;
  return new Date(y, m - 1, 1).toLocaleDateString("de-DE", {
    month: "long",
    year: "numeric",
  });
}

export function cloneZyklusForMonth(source: Zyklus, monat: string): Zyklus {
  const plan: VideoDetails[] = source.plan.map((v, i) => ({
    ...v,
    id: `${monat}-d${v.postingDay}-${i}-${Date.now().toString(36)}`,
    skript: { ...v.skript },
    drehAnleitung: [...v.drehAnleitung],
  }));
  return {
    id: buildZyklusId(source.nische, 1),
    nische: source.nische,
    monat,
    plan,
    bereichMix: { ...source.bereichMix },
  };
}

export function nextFreeMonthYm(calendars: Zyklus[], fromYm: string): string {
  let candidate = addMonthsToYm(fromYm, 1);
  const used = new Set(calendars.map((c) => c.monat));
  while (used.has(candidate)) {
    candidate = addMonthsToYm(candidate, 1);
  }
  return candidate;
}

export function withZyklusMonat(zyklus: Zyklus, monat: string): Zyklus {
  return { ...zyklus, monat, id: buildZyklusId(zyklus.nische, 1) };
}
