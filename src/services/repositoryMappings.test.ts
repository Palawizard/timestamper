import { describe, expect, it } from "vitest";
import { mapTimestampMarkRow } from "./marksRepository";
import { mapAppSettingsRow, createDefaultAppSettings } from "./settingsRepository";
import { mapStreamSessionRow } from "./sessionsRepository";

describe("repository mappings", () => {
  it("maps stream session rows to domain objects", () => {
    expect(
      mapStreamSessionRow({
        id: "session-1",
        title: null,
        started_at: "2026-05-31T20:00:00.000Z",
        ended_at: "2026-05-31T21:00:00.000Z",
        duration_ms: 3_600_000,
        status: "completed",
        created_at: "2026-05-31T20:00:00.000Z",
        updated_at: "2026-05-31T21:00:00.000Z",
      }),
    ).toEqual({
      id: "session-1",
      title: null,
      startedAt: "2026-05-31T20:00:00.000Z",
      endedAt: "2026-05-31T21:00:00.000Z",
      durationMs: 3_600_000,
      status: "completed",
      createdAt: "2026-05-31T20:00:00.000Z",
      updatedAt: "2026-05-31T21:00:00.000Z",
    });
  });

  it("rejects unknown stream session statuses", () => {
    expect(() =>
      mapStreamSessionRow({
        id: "session-1",
        title: null,
        started_at: "2026-05-31T20:00:00.000Z",
        ended_at: null,
        duration_ms: null,
        status: "paused",
        created_at: "2026-05-31T20:00:00.000Z",
        updated_at: "2026-05-31T20:00:00.000Z",
      }),
    ).toThrow("Unknown stream session status");
  });

  it("maps timestamp mark rows to domain objects", () => {
    expect(
      mapTimestampMarkRow({
        id: "mark-1",
        stream_session_id: "session-1",
        offset_ms: 12_000,
        note: null,
        created_at: "2026-05-31T20:00:12.000Z",
      }),
    ).toEqual({
      id: "mark-1",
      streamSessionId: "session-1",
      offsetMs: 12_000,
      note: null,
      createdAt: "2026-05-31T20:00:12.000Z",
    });
  });

  it("maps app settings rows to domain objects", () => {
    expect(
      mapAppSettingsRow({
        id: "default",
        start_stop_hotkey: "Ctrl+Alt+F9",
        add_mark_hotkey: "Ctrl+Alt+F10",
        timestamp_format: "hh:mm:ss",
        created_at: "2026-05-31T20:00:00.000Z",
        updated_at: "2026-05-31T20:00:00.000Z",
      }),
    ).toEqual({
      startStopHotkey: "Ctrl+Alt+F9",
      addMarkHotkey: "Ctrl+Alt+F10",
      timestampFormat: "hh:mm:ss",
      createdAt: "2026-05-31T20:00:00.000Z",
      updatedAt: "2026-05-31T20:00:00.000Z",
    });
  });

  it("creates default app settings", () => {
    expect(createDefaultAppSettings("2026-05-31T20:00:00.000Z")).toEqual({
      startStopHotkey: "Ctrl+Alt+F9",
      addMarkHotkey: "Ctrl+Alt+F10",
      timestampFormat: "hh:mm:ss",
      createdAt: "2026-05-31T20:00:00.000Z",
      updatedAt: "2026-05-31T20:00:00.000Z",
    });
  });
});
