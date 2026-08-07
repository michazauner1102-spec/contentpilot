import type { AccountMeta, PersistedFlow } from "@/lib/accounts/flowPersistence";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionState {
  user: SessionUser | null;
  accounts: AccountMeta[];
  activeAccountId: string | null;
}

async function json<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Fehler ${res.status}`);
  return data;
}

export async function fetchSession(): Promise<SessionState> {
  const data = await json<{
    user: SessionUser | null;
    workspaces?: AccountMeta[];
    activeWorkspaceId?: string | null;
  }>(await fetch("/api/auth/me", { cache: "no-store" }));

  return {
    user: data.user,
    accounts: data.workspaces ?? [],
    activeAccountId: data.activeWorkspaceId ?? null,
  };
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function loadFlow(
  accountId: string
): Promise<PersistedFlow | null> {
  const data = await json<{ flow: PersistedFlow | null }>(
    await fetch(`/api/workspaces/${accountId}/flow`, { cache: "no-store" })
  );
  return data.flow;
}

export async function saveFlow(
  accountId: string,
  flow: PersistedFlow
): Promise<AccountMeta> {
  const data = await json<{ workspace: AccountMeta }>(
    await fetch(`/api/workspaces/${accountId}/flow`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flow }),
    })
  );
  return data.workspace;
}

export async function createAccount(name?: string): Promise<AccountMeta> {
  const data = await json<{ workspace: AccountMeta }>(
    await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  );
  return data.workspace;
}

export async function renameAccount(
  accountId: string,
  name: string
): Promise<AccountMeta> {
  const data = await json<{ workspace: AccountMeta }>(
    await fetch(`/api/workspaces/${accountId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
  );
  return data.workspace;
}

export async function deleteAccount(accountId: string): Promise<{
  accounts: AccountMeta[];
  activeAccountId: string | null;
}> {
  const data = await json<{
    workspaces: AccountMeta[];
    activeWorkspaceId: string | null;
  }>(
    await fetch(`/api/workspaces/${accountId}`, { method: "DELETE" })
  );
  return {
    accounts: data.workspaces,
    activeAccountId: data.activeWorkspaceId,
  };
}
