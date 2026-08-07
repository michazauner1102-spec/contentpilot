import { Pool } from "pg";
import type { PersistedFlow } from "@/lib/accounts/flowPersistence";
import type { DataStore, UserRecord, WorkspaceRecord } from "@/lib/db/types";

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  created_at: Date;
}

interface WorkspaceRow {
  id: string;
  user_id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

function toUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    passwordHash: row.password_hash,
    createdAt: row.created_at.toISOString(),
  };
}

function toWorkspace(row: WorkspaceRow): WorkspaceRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workspaces (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  flow       JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS workspaces_user_id_idx ON workspaces (user_id);
`;

export function createPostgresStore(connectionString: string): DataStore {
  // Managed Postgres (Render, Neon, Supabase) verlangt TLS, akzeptiert aber oft
  // kein öffentlich verifizierbares Zertifikat.
  const needsSsl = !/localhost|127\.0\.0\.1/.test(connectionString);
  const pool = new Pool({
    connectionString,
    ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });

  let initialized: Promise<void> | null = null;

  async function ready(): Promise<void> {
    if (!initialized) {
      initialized = pool.query(SCHEMA).then(() => undefined);
    }
    await initialized;
  }

  return {
    async init() {
      await ready();
    },

    async createUser({ email, name, passwordHash }) {
      await ready();
      const { rows } = await pool.query<UserRow>(
        `INSERT INTO users (email, name, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, email, name, password_hash, created_at`,
        [email.toLowerCase(), name, passwordHash]
      );
      return toUser(rows[0]);
    },

    async findUserByEmail(email) {
      await ready();
      const { rows } = await pool.query<UserRow>(
        `SELECT id, email, name, password_hash, created_at
         FROM users WHERE email = $1`,
        [email.toLowerCase()]
      );
      return rows[0] ? toUser(rows[0]) : null;
    },

    async findUserById(id) {
      await ready();
      const { rows } = await pool.query<UserRow>(
        `SELECT id, email, name, password_hash, created_at
         FROM users WHERE id = $1`,
        [id]
      );
      return rows[0] ? toUser(rows[0]) : null;
    },

    async listWorkspaces(userId) {
      await ready();
      const { rows } = await pool.query<WorkspaceRow>(
        `SELECT id, user_id, name, created_at, updated_at
         FROM workspaces WHERE user_id = $1 ORDER BY created_at ASC`,
        [userId]
      );
      return rows.map(toWorkspace);
    },

    async createWorkspace(userId, name) {
      await ready();
      const { rows } = await pool.query<WorkspaceRow>(
        `INSERT INTO workspaces (user_id, name)
         VALUES ($1, $2)
         RETURNING id, user_id, name, created_at, updated_at`,
        [userId, name]
      );
      return toWorkspace(rows[0]);
    },

    async renameWorkspace(userId, workspaceId, name) {
      await ready();
      const { rows } = await pool.query<WorkspaceRow>(
        `UPDATE workspaces SET name = $3, updated_at = now()
         WHERE id = $2 AND user_id = $1
         RETURNING id, user_id, name, created_at, updated_at`,
        [userId, workspaceId, name]
      );
      return rows[0] ? toWorkspace(rows[0]) : null;
    },

    async deleteWorkspace(userId, workspaceId) {
      await ready();
      const res = await pool.query(
        `DELETE FROM workspaces WHERE id = $2 AND user_id = $1`,
        [userId, workspaceId]
      );
      return (res.rowCount ?? 0) > 0;
    },

    async loadFlow(userId, workspaceId) {
      await ready();
      const { rows } = await pool.query<{ flow: PersistedFlow | null }>(
        `SELECT flow FROM workspaces WHERE id = $2 AND user_id = $1`,
        [userId, workspaceId]
      );
      return rows[0]?.flow ?? null;
    },

    async saveFlow(userId, workspaceId, flow) {
      await ready();
      const { rows } = await pool.query<WorkspaceRow>(
        `UPDATE workspaces SET flow = $3::jsonb, updated_at = now()
         WHERE id = $2 AND user_id = $1
         RETURNING id, user_id, name, created_at, updated_at`,
        [userId, workspaceId, JSON.stringify(flow)]
      );
      return rows[0] ? toWorkspace(rows[0]) : null;
    },
  };
}
