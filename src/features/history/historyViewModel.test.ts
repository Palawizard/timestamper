import { describe, expect, it } from "vitest";
import type { StreamSession } from "../../domain/streamSession";
import {
  createStreamHistoryItem,
  createStreamSummary,
} from "./historyViewModel";

const completedStream: StreamSession = {
  id: "stream-1",
  title: null,
  startedAt: "2026-06-01T19:00:00.000Z",
  endedAt: "2026-06-01T20:05:02.000Z",
  durationMs: 3_902_000,
  status: "completed",
  createdAt: "2026-06-01T19:00:00.000Z",
  updatedAt: "2026-06-01T20:05:02.000Z",
};

describe("history view model", () => {
  it("creates a stream summary", () => {
    expect(createStreamSummary(completedStream, 3)).toEqual({
      duration: "01:05:02",
      markCount: 3,
    });
  });

  it("falls back to zero duration when no duration is saved", () => {
    expect(
      createStreamSummary(
        {
          ...completedStream,
          durationMs: null,
        },
        0,
      ),
    ).toEqual({
      duration: "00:00:00",
      markCount: 0,
    });
  });

  it("creates a stream history item", () => {
    expect(createStreamHistoryItem(completedStream, 2)).toEqual({
      stream: completedStream,
      summary: {
        duration: "01:05:02",
        markCount: 2,
      },
    });
  });
});
