import type { PersistedFlow } from "@/lib/accounts/flowPersistence";

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

/** Öffentliche Sicht auf einen User — nie den Hash an den Client geben. */
export interface UserDto {
  id: string;
  email: string;
  name: string;
}

/** Im UI „Account" — ein Content-Projekt (Nische) eines Users. */
export interface WorkspaceRecord {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceDto {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataStore {
  /** Tabellen/Datei anlegen, falls nötig. Mehrfach aufrufbar. */
  init(): Promise<void>;

  createUser(input: {
    email: string;
    name: string;
    passwordHash: string;
  }): Promise<UserRecord>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
  findUserById(id: string): Promise<UserRecord | null>;

  listWorkspaces(userId: string): Promise<WorkspaceRecord[]>;
  createWorkspace(userId: string, name: string): Promise<WorkspaceRecord>;
  renameWorkspace(
    userId: string,
    workspaceId: string,
    name: string
  ): Promise<WorkspaceRecord | null>;
  deleteWorkspace(userId: string, workspaceId: string): Promise<boolean>;

  loadFlow(userId: string, workspaceId: string): Promise<PersistedFlow | null>;
  saveFlow(
    userId: string,
    workspaceId: string,
    flow: PersistedFlow
  ): Promise<WorkspaceRecord | null>;
}

export function toUserDto(user: UserRecord): UserDto {
  return { id: user.id, email: user.email, name: user.name };
}

export function toWorkspaceDto(workspace: WorkspaceRecord): WorkspaceDto {
  return {
    id: workspace.id,
    name: workspace.name,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}
