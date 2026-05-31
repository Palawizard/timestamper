import type { TimestampFormat } from "./settings";

const MILLISECONDS_PER_SECOND = 1_000;
const SECONDS_PER_MINUTE = 60;
const MINUTES_PER_HOUR = 60;

function toWholeSeconds(milliseconds: number): number {
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) {
    return 0;
  }

  return Math.floor(milliseconds / MILLISECONDS_PER_SECOND);
}

function padTimePart(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatTimestamp(
  offsetMs: number,
  format: TimestampFormat = "hh:mm:ss",
): string {
  const totalSeconds = toWholeSeconds(offsetMs);
  const totalMinutes = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  if (format === "mm:ss") {
    return `${padTimePart(totalMinutes)}:${padTimePart(seconds)}`;
  }

  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  return `${padTimePart(hours)}:${padTimePart(minutes)}:${padTimePart(seconds)}`;
}
