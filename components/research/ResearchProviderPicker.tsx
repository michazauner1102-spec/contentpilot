"use client";

import {
  RESEARCH_WEB_PROVIDER_OPTIONS,
  type WebResearchProviderId,
} from "@/lib/research/webResearchProviders";

interface ResearchProviderPickerProps {
  value: WebResearchProviderId;
  onChange: (id: WebResearchProviderId) => void;
  lastSourceLabel?: string | null;
  disabled?: boolean;
  compact?: boolean;
}

export function ResearchProviderPicker({
  value,
  onChange,
  lastSourceLabel,
  disabled,
  compact,
}: ResearchProviderPickerProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Web-Recherche</span>
        {lastSourceLabel && (
          <span className="text-xs rounded-full border border-[var(--border)] px-2 py-0.5 text-[var(--muted)]">
            Zuletzt: {lastSourceLabel}
          </span>
        )}
      </div>
      <div className={`flex flex-wrap gap-2 ${compact ? "" : ""}`}>
        {RESEARCH_WEB_PROVIDER_OPTIONS.map((opt) => {
          const on = value === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.id)}
              title={opt.detail}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition max-w-[180px] disabled:opacity-50 ${
                on
                  ? "border-[var(--accent)] bg-[var(--surface-elevated)]"
                  : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
              }`}
            >
              <span className="font-medium block">{opt.label}</span>
              {!compact && (
                <span className="opacity-70 line-clamp-2">{opt.detail}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
