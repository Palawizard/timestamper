import type { TimestampMark } from "../../domain/timestampMark";
import { formatTimestamp } from "../../domain/timeFormat";
import type { StreamHistoryItem } from "../history/historyViewModel";

export function formatMarksAsPlainText(marks: TimestampMark[]): string {
  return marks.map((mark) => formatTimestamp(mark.offsetMs)).join("\n");
}

function escapeCsvValue(value: string | number | null): string {
  const text = value === null ? "" : String(value);

  if (!/[",\n\r]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function formatStreamMarksAsCsv(
  item: StreamHistoryItem,
  marks: TimestampMark[],
): string {
  const rows = [
    ["stream_id", "stream_started_at", "timestamp", "offset_ms", "note"],
    ...marks.map((mark) => [
      item.stream.id,
      item.stream.startedAt,
      formatTimestamp(mark.offsetMs),
      mark.offsetMs,
      mark.note,
    ]),
  ];

  return rows
    .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

export function createExportFileName(
  item: StreamHistoryItem,
  extension: string,
): string {
  const startedAt = item.stream.startedAt.replace(/[:.]/g, "-");

  return `stream-${startedAt}.${extension}`;
}
