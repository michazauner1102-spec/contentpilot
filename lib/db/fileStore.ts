import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import type { PersistedFlow } from "@/lib/accounts/flowPersistence";
import type { DataStore, UserRecord, WorkspaceRecord } from "@/lib/db/types";

interface FileShape {
  users: UserRecord[];
  workspaces: WorkspaceRecord[];
  flows: Record<string, PersistedFlow>;
}

const EMPTY: FileShape = { users: [], workspaces: [], flows: {} };

function dataFilePath(): string {
  const dir = process.env.CONTENTPILOT_DATA_DIR?.trim() || ".data";
  return join(process.cwd(), dir, "contentpilot.json");
}

/**
 * Entwicklungs-Store ohne Datenbank: eine JSON-Datei.
 * Schreibvorgänge werden serialisiert, damit parallele Requests sich nicht überschreiben.
 */
export function createFileStore(): DataStore {
  const path = dataFilePath();
  let queue: Promise<unknown> = Promise.resolve();

  async function read(): Promise<FileShape> {
    try {
      const raw = await readFile(path, "utf8");
      const parsed = JSON.parse(raw) as Partial<FileShape>;
      return {
        users: parsed.users ?? [],
        workspaces: parsed.workspaces ?? [],
        flows: parsed.flows ?? {},
      };
    } catch {
      return { ...EMPTY };
    }
  }

  async function write(data: FileShape): Promise<void> {
    await mkdir(dirname(path), { recursive: true });
    const tmp = `${path}.${randomUUID()}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
    await rename(tmp, path);
  }

  /** Alle Mutationen laufen nacheinander (Read-Modify-Write ist sonst nicht atomar). */
  function transaction<T>(fn: (data: FileShape) => Promise<T> | T): Promise<T> {
    const run = queue.then(async () => {
      const data = await read();
      const result = await fn(data);
      await write(data);
      return result;
    });
    queue = run.catch(() => undefined);
    return run;
  }

  function nowIso(): string {
    return new Date().toISOString();
  }

  return {
    async init() {
      await mkdir(dirname(path), { recursive: true });
    },

    async createUser({ email, name, passwordHash }) {
      return transaction((data) => {
        const user: UserRecord = {
          id: randomUUID(),
          email: email.toLowerCase(),
          name,
          passwordHash,
          createdAt: nowIso(),
        };
        data.users.push(user);
        return user;
      });
    },

    async findUserByEmail(email) {
      const data = await read();
      const lower = email.toLowerCase();
      return data.users.find((u) => u.email === lower) ?? null;
    },

    async findUserById(id) {
      const data = await read();
      return data.users.find((u) => u.id === id) ?? null;
    },

    async listWorkspaces(userId) {
      const data = await read();
      return data.workspaces
        .filter((w) => w.userId === userId)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },

    async createWorkspace(userId, name) {
      return transaction((data) => {
        const t = nowIso();
        const workspace: WorkspaceRecord = {
          id: randomUUID(),
          userId,
          name,
          createdAt: t,
          updatedAt: t,
        };
        data.workspaces.push(workspace);
        return workspace;
      });
    },

    async renameWorkspace(userId, workspaceId, name) {
      return transaction((data) => {
        const w = data.workspaces.find(
          (x) => x.id === workspaceId && x.userId === userId
        );
        if (!w) return null;
        w.name = name;
        w.updatedAt = nowIso();
        return w;
      });
    },

    async deleteWorkspace(userId, workspaceId) {
      return transaction((data) => {
        const before = data.workspaces.length;
        data.workspaces = data.workspaces.filter(
          (x) => !(x.id === workspaceId && x.userId === userId)
        );
        delete data.flows[workspaceId];
        return data.workspaces.length < before;
      });
    },

    async loadFlow(userId, workspaceId) {
      const data = await read();
      const owns = data.workspaces.some(
        (x) => x.id === workspaceId && x.userId === userId
      );
      if (!owns) return null;
      return data.flows[workspaceId] ?? null;
    },

    async saveFlow(userId, workspaceId, flow) {
      return transaction((data) => {
        const w = data.workspaces.find(
          (x) => x.id === workspaceId && x.userId === userId
        );
        if (!w) return null;
        data.flows[workspaceId] = flow;
        w.updatedAt = nowIso();
        return w;
      });
    },
  };
}
