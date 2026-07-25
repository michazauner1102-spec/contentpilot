"use client";

import { useEffect, useState } from "react";
import {
  applyTheme,
  getStoredTheme,
  toggleTheme,
  type ThemeMode,
} from "@/lib/ui/themeMode";
import { BTN_SECONDARY } from "@/lib/ui/theme";

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setMode(stored);
    applyTheme(stored);
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-10 rounded-lg border border-[var(--border)] bg-[var(--surface)]"
        aria-hidden
      />
    );
  }

  return (
    <button
      type="button"
      className={`${BTN_SECONDARY} w-full flex items-center justify-center gap-2`}
      onClick={() => setMode((m) => toggleTheme(m))}
      aria-pressed={mode === "light"}
    >
      <span className="text-base leading-none" aria-hidden>
        {mode === "dark" ? "☀️" : "🌙"}
      </span>
      {mode === "dark" ? "White Mode" : "Dark Mode"}
    </button>
  );
}
