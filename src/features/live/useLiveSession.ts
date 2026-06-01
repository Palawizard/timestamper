import { useCallback, useEffect, useState } from "react";
import type { StreamSession } from "../../domain/streamSession";
import { calculateElapsedMs } from "../../domain/timeDuration";
import { completeStreamSession, createStreamSession } from "./liveSession";

export type LiveSessionStatus = "ready" | "running";

export type LiveSessionState = {
  activeSession: StreamSession | null;
  elapsedMs: number;
  lastCompletedSession: StreamSession | null;
  status: LiveSessionStatus;
};

export type UseLiveSessionResult = LiveSessionState & {
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
};

export function useLiveSession(): UseLiveSessionResult {
  const [activeSession, setActiveSession] = useState<StreamSession | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastCompletedSession, setLastCompletedSession] =
    useState<StreamSession | null>(null);

  useEffect(() => {
    if (activeSession === null) {
      return;
    }

    const startedAtMs = Date.parse(activeSession.startedAt);
    const intervalId = window.setInterval(() => {
      setElapsedMs(calculateElapsedMs(startedAtMs, Date.now()));
    }, 500);

    return () => window.clearInterval(intervalId);
  }, [activeSession]);

  const startSession = useCallback(async () => {
    const now = new Date().toISOString();
    setActiveSession(createStreamSession(now));
    setElapsedMs(0);
    setLastCompletedSession(null);
  }, []);

  const stopSession = useCallback(async () => {
    const now = new Date().toISOString();

    setActiveSession((currentSession) => {
      if (currentSession === null) {
        return null;
      }

      const completedSession = completeStreamSession(currentSession, now);
      setLastCompletedSession(completedSession);
      setElapsedMs(0);

      return null;
    });
  }, []);

  return {
    activeSession,
    elapsedMs,
    lastCompletedSession,
    status: activeSession === null ? "ready" : "running",
    startSession,
    stopSession,
  };
}
