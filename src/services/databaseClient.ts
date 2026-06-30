import type { QueryResult } from "@tauri-apps/plugin-sql";

export type SqlValue = string | number | null;

export type DatabaseClient = {
  execute(query: string, bindValues?: SqlValue[]): Promise<QueryResult>;
  select<T>(query: string, bindValues?: SqlValue[]): Promise<T>;
};
