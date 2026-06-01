import type { AppSettings, TimestampFormat } from "../domain/settings";
import { getDatabase } from "./database";
import type { DatabaseClient } from "./databaseClient";

type AppSettingsRow = {
  id: string;
  start_stop_hotkey: string;
  add_mark_hotkey: string;
  timestamp_format: string;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_SETTINGS_ID = "default";
export const DEFAULT_START_STOP_HOTKEY = "Ctrl+Alt+F9";
export const DEFAULT_ADD_MARK_HOTKEY = "Ctrl+Alt+F10";
export const DEFAULT_TIMESTAMP_FORMAT: TimestampFormat = "hh:mm:ss";

const APP_SETTINGS_COLUMNS = `
  id,
  start_stop_hotkey,
  add_mark_hotkey,
  timestamp_format,
  created_at,
  updated_at
`;

function isTimestampFormat(value: string): value is TimestampFormat {
  return value === "hh:mm:ss" || value === "mm:ss";
}

export function createDefaultAppSettings(now: string): AppSettings {
  return {
    startStopHotkey: DEFAULT_START_STOP_HOTKEY,
    addMarkHotkey: DEFAULT_ADD_MARK_HOTKEY,
    timestampFormat: DEFAULT_TIMESTAMP_FORMAT,
    createdAt: now,
    updatedAt: now,
  };
}

export function mapAppSettingsRow(row: AppSettingsRow): AppSettings {
  if (!isTimestampFormat(row.timestamp_format)) {
    throw new Error(`Unknown timestamp format: ${row.timestamp_format}`);
  }

  return {
    startStopHotkey: row.start_stop_hotkey,
    addMarkHotkey: row.add_mark_hotkey,
    timestampFormat: row.timestamp_format,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function getClient(client?: DatabaseClient): Promise<DatabaseClient> {
  return client ?? getDatabase();
}

export async function saveAppSettings(
  settings: AppSettings,
  client?: DatabaseClient,
): Promise<void> {
  const database = await getClient(client);

  await database.execute(
    `
      INSERT INTO app_settings (
        id,
        start_stop_hotkey,
        add_mark_hotkey,
        timestamp_format,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT(id) DO UPDATE SET
        start_stop_hotkey = excluded.start_stop_hotkey,
        add_mark_hotkey = excluded.add_mark_hotkey,
        timestamp_format = excluded.timestamp_format,
        updated_at = excluded.updated_at
    `,
    [
      DEFAULT_SETTINGS_ID,
      settings.startStopHotkey,
      settings.addMarkHotkey,
      settings.timestampFormat,
      settings.createdAt,
      settings.updatedAt,
    ],
  );
}

export async function getAppSettings(
  client?: DatabaseClient,
): Promise<AppSettings | null> {
  const database = await getClient(client);
  const rows = await database.select<AppSettingsRow[]>(
    `SELECT ${APP_SETTINGS_COLUMNS} FROM app_settings WHERE id = $1`,
    [DEFAULT_SETTINGS_ID],
  );

  return rows[0] === undefined ? null : mapAppSettingsRow(rows[0]);
}

export async function getOrCreateAppSettings(
  now = new Date().toISOString(),
  client?: DatabaseClient,
): Promise<AppSettings> {
  const existingSettings = await getAppSettings(client);

  if (existingSettings !== null) {
    return existingSettings;
  }

  const defaultSettings = createDefaultAppSettings(now);
  await saveAppSettings(defaultSettings, client);

  return defaultSettings;
}
