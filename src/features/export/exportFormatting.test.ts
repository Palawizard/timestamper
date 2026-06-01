import { describe, expect, it } from "vitest";
import type { TimestampMark } from "../../domain/timestampMark";
import type { StreamHistoryItem } from "../history/historyViewModel";
import {
  createExportFileName,
  formatMarksAsPlainText,
  formatStreamMarksAsCsv,
  formatStreamMarksAsJson,
} from "./exportFormatting";

const item: StreamHistoryItem = {
  stream: {
    id: "stream-1",
    title: "Stream, with title",
    startedAt: "2026-06-01T19:00:00.000Z",
    endedAt: "2026-06-01T20:00:00.000Z",
    durationMs: 3_600_000,
    status: "completed",
    createdAt: "2026-06-01T19:00:00.000Z",
    updatedAt: "2026-06-01T20:00:00.000Z",
  },
  summary: {
    duration: "01:00:00",
    markCount: 2,
  },
};

const marks: TimestampMark[] = [
  {
    id: "mark-1",
    streamSessionId: "stream-1",
    offsetMs: 12_000,
    note: null,
    createdAt: "2026-06-01T19:00:12.000Z",
  },
  {
    id: "mark-2",
    streamSessionId: "stream-1",
    offsetMs: 65_000,
    note: 'Boss, "win"',
    createdAt: "2026-06-01T19:01:05.000Z",
  },
];

describe("export formatting", () => {
  it("formats marks as plain text", () => {
    expect(formatMarksAsPlainText(marks)).toBe("00:00:12\n00:01:05");
  });

  it("formats stream marks as CSV", () => {
    expect(formatStreamMarksAsCsv(item, marks)).toBe(
      [
        "stream_id,stream_started_at,timestamp,offset_ms,note",
        "stream-1,2026-06-01T19:00:00.000Z,00:00:12,12000,",
        'stream-1,2026-06-01T19:00:00.000Z,00:01:05,65000,"Boss, ""win"""',
      ].join("\n"),
    );
  });

  it("formats stream marks as JSON", () => {
    expect(JSON.parse(formatStreamMarksAsJson(item, marks))).toEqual({
      stream: item.stream,
      summary: item.summary,
      marks: [
        {
          ...marks[0],
          timestamp: "00:00:12",
        },
        {
          ...marks[1],
          timestamp: "00:01:05",
        },
      ],
    });
  });

  it("creates export file names", () => {
    expect(createExportFileName(item, "csv")).toBe(
      "stream-2026-06-01T19-00-00-000Z.csv",
    );
  });
});
