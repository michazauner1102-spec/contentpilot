import { createFileStore } from "@/lib/db/fileStore";
import { createPostgresStore } from "@/lib/db/postgresStore";
import type { DataStore } from "@/lib/db/types";

export type { DataStore, UserDto, WorkspaceDto } from "@/lib/db/types";
export { toUserDto, toWorkspaceDto } from "@/lib/db/types";

let store: DataStore | null = null;

/**
 * Mit DATABASE_URL → Postgres (Produktion), sonst JSON-Datei unter .data/
 * (lokale Entwicklung ohne Datenbank).
 */
export function getStore(): DataStore {
  if (store) return store;
  const url = process.env.DATABASE_URL?.trim();
  store = url ? createPostgresStore(url) : createFileStore();
  return store;
}

export function storeLabel(): string {
  return process.env.DATABASE_URL?.trim() ? "postgres" : "datei (.data)";
}
