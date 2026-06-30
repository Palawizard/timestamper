import type {
  StreamSession,
  StreamSessionControlSource,
} from "../../domain/streamSession";
import type { TimestampMark } from "../../domain/timestampMark";
import {
  calculateDurationMs,
  calculateElapsedMs,
} from "../../domain/timeDuration";

export type IdGenerator = () => string;

export function createStreamSession(
  now: string,
  generateId: IdGenerator = crypto.randomUUID.bind(crypto),
  controlSource: StreamSessionControlSource = "manual",
): StreamSession {
  return {
    id: generateId(),
    title: null,
    startedAt: now,
    endedAt: null,
    durationMs: null,
    status: "active",
    controlSource,
    createdAt: now,
    updatedAt: now,
  };
}

export function completeStreamSession(
  session: StreamSession,
  endedAt: string,
): StreamSession {
  return {
    ...session,
    endedAt,
    durationMs: calculateDurationMs(session.startedAt, endedAt),
    status: "completed",
    updatedAt: endedAt,
  };
}

export function createTimestampMark(
  session: StreamSession,
  now: string,
  generateId: IdGenerator = crypto.randomUUID.bind(crypto),
): TimestampMark {
  return {
    id: generateId(),
    streamSessionId: session.id,
    offsetMs: calculateElapsedMs(
      Date.parse(session.startedAt),
      Date.parse(now),
    ),
    note: null,
    createdAt: now,
  };
}
