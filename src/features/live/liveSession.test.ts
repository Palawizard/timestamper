import { describe, expect, it } from "vitest";
import {
  completeStreamSession,
  createStreamSession,
  createTimestampMark,
} from "./liveSession";

describe("live session lifecycle", () => {
  it("creates an active stream session", () => {
    expect(
      createStreamSession("2026-06-01T19:00:00.000Z", () => "session-1"),
    ).toEqual({
      id: "session-1",
      title: null,
      startedAt: "2026-06-01T19:00:00.000Z",
      endedAt: null,
      durationMs: null,
      status: "active",
      createdAt: "2026-06-01T19:00:00.000Z",
      updatedAt: "2026-06-01T19:00:00.000Z",
    });
  });

  it("completes an active stream session", () => {
    const session = createStreamSession(
      "2026-06-01T19:00:00.000Z",
      () => "session-1",
    );

    expect(completeStreamSession(session, "2026-06-01T19:10:00.000Z")).toEqual({
      ...session,
      endedAt: "2026-06-01T19:10:00.000Z",
      durationMs: 600_000,
      status: "completed",
      updatedAt: "2026-06-01T19:10:00.000Z",
    });
  });

  it("creates a timestamp mark with the current stream offset", () => {
    const session = createStreamSession(
      "2026-06-01T19:00:00.000Z",
      () => "session-1",
    );

    expect(
      createTimestampMark(session, "2026-06-01T19:02:03.456Z", () => "mark-1"),
    ).toEqual({
      id: "mark-1",
      streamSessionId: "session-1",
      offsetMs: 123_456,
      note: null,
      createdAt: "2026-06-01T19:02:03.456Z",
    });
  });

  it("does not create negative timestamp mark offsets", () => {
    const session = createStreamSession(
      "2026-06-01T19:00:00.000Z",
      () => "session-1",
    );

    expect(
      createTimestampMark(session, "2026-06-01T18:59:59.000Z", () => "mark-1")
        .offsetMs,
    ).toBe(0);
  });
});
