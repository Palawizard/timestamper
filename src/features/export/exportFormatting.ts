import type { TimestampMark } from "../../domain/timestampMark";
import { formatTimestamp } from "../../domain/timeFormat";

export function formatMarksAsPlainText(marks: TimestampMark[]): string {
  return marks.map((mark) => formatTimestamp(mark.offsetMs)).join("\n");
}
