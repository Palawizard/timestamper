import { describe, expect, it, vi } from "vitest";
import type { AppSettings } from "../domain/settings";
import type { DatabaseClient } from "./databaseClient";
import { saveAppSettings } from "./settingsRepository";

describe("settings repository", () => {
  it("persists OBS settings without exposing them outside the SQL parameters", async () => {
    const execute = vi.fn().mockResolvedValue({
      lastInsertId: 0,
      rowsAffected: 1,
    });
    const client: DatabaseClient = { execute, select: vi.fn() };
    const settings: AppSettings = {
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      obsEnabled: true,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "secret",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:01:00.000Z",
    };

    await saveAppSettings(settings, client);

    expect(execute).toHaveBeenCalledOnce();
    const [sql, parameters] = execute.mock.calls[0];
    expect(sql).not.toContain("secret");
    expect(parameters).toEqual([
      "default",
      "F9",
      "F10",
      "hh:mm:ss",
      1,
      "127.0.0.1",
      4455,
      "secret",
      "2026-06-30T15:00:00.000Z",
      "2026-06-30T15:01:00.000Z",
    ]);
  });
});
