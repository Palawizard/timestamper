import type { StreamSession } from "../../domain/streamSession";
import { formatTimestamp } from "../../domain/timeFormat";

export type StreamSummary = {
  duration: string;
  markCount: number;
};

export type StreamHistoryItem = {
  stream: StreamSession;
  summary: StreamSummary;
};

export function createStreamSummary(
  stream: StreamSession,
  markCount: number,
): StreamSummary {
  return {
    duration: formatTimestamp(stream.durationMs ?? 0),
    markCount,
  };
}

export function createStreamHistoryItem(
  stream: StreamSession,
  markCount: number,
): StreamHistoryItem {
  return {
    stream,
    summary: createStreamSummary(stream, markCount),
  };
}
