import { describe, expect, it, vi } from "vitest";
import type { DatabaseClient } from "./databaseClient";
import { deleteStreamSession } from "./sessionsRepository";

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
});
