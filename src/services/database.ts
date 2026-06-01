import Database from "@tauri-apps/plugin-sql";

export const DATABASE_URL = "sqlite:timestamper.db";

let database: Database | null = null;

export async function getDatabase(): Promise<Database> {
  if (database === null) {
    database = await Database.load(DATABASE_URL);
  }

  return database;
}
