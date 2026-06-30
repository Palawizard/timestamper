import type { TimestampMark } from "../domain/timestampMark";
import { getDatabase } from "./database";
import type { DatabaseClient } from "./databaseClient";

type TimestampMarkRow = {
  id: string;
  stream_session_id: string;
  offset_ms: number;
  note: string | null;
  created_at: string;
};

export type SaveTimestampMarkInput = TimestampMark;

const TIMESTAMP_MARK_COLUMNS = `
  id,
  stream_session_id,
  offset_ms,
  note,
  created_at
`;

export function mapTimestampMarkRow(row: TimestampMarkRow): TimestampMark {
  return {
    id: row.id,
    streamSessionId: row.stream_session_id,
    offsetMs: row.offset_ms,
    note: row.note,
    createdAt: row.created_at,
  };
}

async function getClient(client?: DatabaseClient): Promise<DatabaseClient> {
  return client ?? getDatabase();
}

export async function saveTimestampMark(
  mark: SaveTimestampMarkInput,
  client?: DatabaseClient,
): Promise<void> {
  const database = await getClient(client);

  await database.execute(
    `
      INSERT INTO timestamp_marks (
        id,
        stream_session_id,
        offset_ms,
        note,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT(id) DO UPDATE SET
        stream_session_id = excluded.stream_session_id,
        offset_ms = excluded.offset_ms,
        note = excluded.note
    `,
    [mark.id, mark.streamSessionId, mark.offsetMs, mark.note, mark.createdAt],
  );
}

export async function getTimestampMarkById(
  id: string,
  client?: DatabaseClient,
): Promise<TimestampMark | null> {
  const database = await getClient(client);
  const rows = await database.select<TimestampMarkRow[]>(
    `SELECT ${TIMESTAMP_MARK_COLUMNS} FROM timestamp_marks WHERE id = $1`,
    [id],
  );

  return rows[0] === undefined ? null : mapTimestampMarkRow(rows[0]);
}

export async function listTimestampMarksForSession(
  streamSessionId: string,
  client?: DatabaseClient,
): Promise<TimestampMark[]> {
  const database = await getClient(client);
  const rows = await database.select<TimestampMarkRow[]>(
    `
      SELECT ${TIMESTAMP_MARK_COLUMNS}
      FROM timestamp_marks
      WHERE stream_session_id = $1
      ORDER BY offset_ms ASC, created_at ASC
    `,
    [streamSessionId],
  );

  return rows.map(mapTimestampMarkRow);
}

export async function countTimestampMarksForSession(
  streamSessionId: string,
  client?: DatabaseClient,
): Promise<number> {
  const database = await getClient(client);
  const rows = await database.select<Array<{ count: number }>>(
    `
      SELECT COUNT(*) as count
      FROM timestamp_marks
      WHERE stream_session_id = $1
    `,
    [streamSessionId],
  );

  return rows[0]?.count ?? 0;
}
