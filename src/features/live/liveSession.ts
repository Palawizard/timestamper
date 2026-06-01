import type { StreamSession } from "../../domain/streamSession";
import { calculateDurationMs } from "../../domain/timeDuration";

export type IdGenerator = () => string;

export function createStreamSession(
  now: string,
  generateId: IdGenerator = crypto.randomUUID.bind(crypto),
): StreamSession {
  return {
    id: generateId(),
    title: null,
    startedAt: now,
    endedAt: null,
    durationMs: null,
    status: "active",
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
