"use client";

import type { AppMenuId } from "@/lib/ui/theme";
import { APP_MENU } from "@/lib/ui/theme";

interface AppSidebarProps {
  active: AppMenuId;
  onChange: (id: AppMenuId) => void;
  showOnboarding?: boolean;
  onOpenOnboarding?: () => void;
}

export function AppSidebar({
  active,
  onChange,
  showOnboarding,
  onOpenOnboarding,
}: AppSidebarProps) {
  return (
    <aside className="w-full lg:w-56 shrink-0 flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
      <div>
        <p className="text-lg font-semibold tracking-tight">ContentPilot</p>
        <p className="text-xs text-[var(--muted)] mt-1">30-Tage Content</p>
      </div>
      <nav className="flex lg:flex-col gap-1">
        {APP_MENU.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`text-left rounded-lg px-3 py-2.5 transition ${
              active === item.id
                ? "bg-[var(--surface-elevated)] border border-[var(--border)] text-[var(--foreground)]"
                : "hover:bg-[var(--surface)] text-[var(--muted-strong)] hover:text-[var(--foreground)]"
            }`}
          >
            <span className="block text-sm font-medium">{item.label}</span>
            <span className="block text-[11px] text-[var(--muted)] mt-0.5">
              {item.description}
            </span>
          </button>
        ))}
      </nav>
      {showOnboarding && onOpenOnboarding && (
        <button
          type="button"
          onClick={onOpenOnboarding}
          className="text-sm rounded-lg border border-[var(--border)] px-3 py-2 hover:bg-[var(--surface)]"
        >
          Plan-Setup öffnen
        </button>
      )}
    </aside>
  );
}
