import { describe, expect, it, vi } from "vitest";
import type { DatabaseClient } from "./databaseClient";
import { deleteStreamSession, saveStreamSession } from "./sessionsRepository";

describe("session repository", () => {
  it("deletes a stream session by id", async () => {
    const execute = vi.fn().mockResolvedValue({
      lastInsertId: 0,
      rowsAffected: 1,
    });
    const client: DatabaseClient = {
      execute,
      select: vi.fn(),
    };

    await deleteStreamSession("session-1", client);

    expect(execute).toHaveBeenCalledWith(
      "DELETE FROM stream_sessions WHERE id = $1",
      ["session-1"],
    );
  });

  it("persists the OBS control source", async () => {
    const execute = vi.fn().mockResolvedValue({
      lastInsertId: 0,
      rowsAffected: 1,
    });
    const client: DatabaseClient = { execute, select: vi.fn() };

    await saveStreamSession(
      {
        id: "session-1",
        title: null,
        startedAt: "2026-06-30T15:00:00.000Z",
        endedAt: null,
        durationMs: null,
        status: "active",
        controlSource: "obs",
        createdAt: "2026-06-30T15:00:00.000Z",
        updatedAt: "2026-06-30T15:00:00.000Z",
      },
      client,
    );

    expect(execute.mock.calls[0][1]).toContain("obs");
  });
});
