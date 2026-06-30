import type {
  StreamSession,
  StreamSessionStatus,
} from "../domain/streamSession";
import { getDatabase } from "./database";
import type { DatabaseClient } from "./databaseClient";

type StreamSessionRow = {
  id: string;
  title: string | null;
  started_at: string;
  ended_at: string | null;
  duration_ms: number | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type SaveStreamSessionInput = StreamSession;

const STREAM_SESSION_COLUMNS = `
  id,
  title,
  started_at,
  ended_at,
  duration_ms,
  status,
  created_at,
  updated_at
`;

function isStreamSessionStatus(value: string): value is StreamSessionStatus {
  return value === "active" || value === "completed";
}

export function mapStreamSessionRow(row: StreamSessionRow): StreamSession {
  if (!isStreamSessionStatus(row.status)) {
    throw new Error(`Unknown stream session status: ${row.status}`);
  }

  return {
    id: row.id,
    title: row.title,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMs: row.duration_ms,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getClient(client?: DatabaseClient): Promise<DatabaseClient> {
  return client ?? getDatabase();
}

export async function saveStreamSession(
  session: SaveStreamSessionInput,
  client?: DatabaseClient,
): Promise<void> {
  const database = await getClient(client);

  await database.execute(
    `
      INSERT INTO stream_sessions (
        id,
        title,
        started_at,
        ended_at,
        duration_ms,
        status,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT(id) DO UPDATE SET
        title = excluded.title,
        started_at = excluded.started_at,
        ended_at = excluded.ended_at,
        duration_ms = excluded.duration_ms,
        status = excluded.status,
        updated_at = excluded.updated_at
    `,
    [
      session.id,
      session.title,
      session.startedAt,
      session.endedAt,
      session.durationMs,
      session.status,
      session.createdAt,
      session.updatedAt,
    ],
  );
}

export async function getStreamSessionById(
  id: string,
  client?: DatabaseClient,
): Promise<StreamSession | null> {
  const database = await getClient(client);
  const rows = await database.select<StreamSessionRow[]>(
    `SELECT ${STREAM_SESSION_COLUMNS} FROM stream_sessions WHERE id = $1`,
    [id],
  );

  return rows[0] === undefined ? null : mapStreamSessionRow(rows[0]);
}

export async function getActiveStreamSession(
  client?: DatabaseClient,
): Promise<StreamSession | null> {
  const database = await getClient(client);
  const rows = await database.select<StreamSessionRow[]>(
    `
      SELECT ${STREAM_SESSION_COLUMNS}
      FROM stream_sessions
      WHERE status = $1
      ORDER BY started_at DESC
      LIMIT 1
    `,
    ["active"],
  );

  return rows[0] === undefined ? null : mapStreamSessionRow(rows[0]);
}

export async function listActiveStreamSessions(
  client?: DatabaseClient,
): Promise<StreamSession[]> {
  const database = await getClient(client);
  const rows = await database.select<StreamSessionRow[]>(
    `
      SELECT ${STREAM_SESSION_COLUMNS}
      FROM stream_sessions
      WHERE status = $1
      ORDER BY started_at DESC
    `,
    ["active"],
  );

  return rows.map(mapStreamSessionRow);
}

export async function listCompletedStreamSessions(
  client?: DatabaseClient,
): Promise<StreamSession[]> {
  const database = await getClient(client);
  const rows = await database.select<StreamSessionRow[]>(
    `
      SELECT ${STREAM_SESSION_COLUMNS}
      FROM stream_sessions
      WHERE status = $1
      ORDER BY started_at DESC
    `,
    ["completed"],
  );

  return rows.map(mapStreamSessionRow);
}

export async function deleteStreamSession(
  id: string,
  client?: DatabaseClient,
): Promise<void> {
  const database = await getClient(client);

  await database.execute(`DELETE FROM stream_sessions WHERE id = $1`, [id]);
}
