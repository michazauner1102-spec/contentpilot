"use client";

import { useState } from "react";
import type { AccountMeta } from "@/lib/accounts/flowPersistence";
import { BTN_SECONDARY } from "@/lib/ui/theme";

interface AccountSwitcherProps {
  accounts: AccountMeta[];
  activeId: string;
  onSwitch: (accountId: string) => void;
  onCreate: () => void;
  onRename: (accountId: string, name: string) => void;
  onDelete: (accountId: string) => void;
  onRefresh?: () => void;
}

export function AccountSwitcher({
  accounts,
  activeId,
  onSwitch,
  onCreate,
  onRename,
  onDelete,
  onRefresh,
}: AccountSwitcherProps) {
  const [open, setOpen] = useState(false);
  const active = accounts.find((a) => a.id === activeId);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
            Account
          </p>
          <p className="text-sm font-medium truncate" title={active?.name}>
            {active?.name ?? "—"}
          </p>
        </div>
        <button
          type="button"
          className="text-xs text-[var(--muted-strong)] hover:text-[var(--foreground)] shrink-0"
          onClick={() => {
            onRefresh?.();
            setOpen((o) => !o);
          }}
          aria-expanded={open}
        >
          {open ? "▲" : "▼"}
        </button>
      </div>

      {open && (
        <ul className="space-y-1 max-h-48 overflow-y-auto">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onSwitch(a.id);
                  setOpen(false);
                }}
                className={`flex-1 text-left rounded-md px-2 py-1.5 text-xs truncate ${
                  a.id === activeId
                    ? "bg-[var(--surface-elevated)] border border-[var(--border)]"
                    : "hover:bg-[var(--surface-elevated)]"
                }`}
                title={a.name}
              >
                {a.name}
              </button>
              {accounts.length > 1 && a.id === activeId && (
                <button
                  type="button"
                  className="text-[10px] text-[var(--muted)] hover:text-red-400 px-1"
                  title="Account löschen"
                  onClick={() => {
                    if (
                      confirm(
                        `Account „${a.name}“ löschen? Der gespeicherte Stand geht verloren.`
                      )
                    ) {
                      onDelete(a.id);
                      setOpen(false);
                    }
                  }}
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-1.5 pt-1">
        <button
          type="button"
          onClick={() => {
            onCreate();
            setOpen(true);
          }}
          className={`${BTN_SECONDARY} w-full text-xs py-2`}
        >
          + Neuer Account
        </button>
        {active && (
          <button
            type="button"
            className="text-[11px] text-[var(--muted)] hover:text-[var(--foreground)] text-left"
            onClick={() => {
              const next = prompt("Account umbenennen:", active.name);
              if (next?.trim()) onRename(active.id, next.trim());
            }}
          >
            Umbenennen…
          </button>
        )}
      </div>
    </div>
  );
}
