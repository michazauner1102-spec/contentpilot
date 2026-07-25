/** Sichtbar auf öffentlicher Demo (Render/Vercel ohne API-Keys). */
export function DemoModeBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
    return null;
  }

  return (
    <div
      className="shrink-0 border-b border-[var(--border)] bg-[var(--surface-elevated)] px-4 py-2 text-center text-xs sm:text-sm text-[var(--muted-strong)]"
      role="status"
    >
      <span className="font-semibold text-[var(--foreground)]">Live-Demo</span>
      {" · "}
      Mock-Metriken &amp; Demo-Skripte — keine API-Keys nötig. Daten bleiben in deinem
      Browser (localStorage).
    </div>
  );
}
