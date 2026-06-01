import { useCallback, useState } from "react";
import type { StreamSession } from "../../domain/streamSession";
import { completeStreamSession, createStreamSession } from "./liveSession";

export type LiveSessionStatus = "ready" | "running";

export type LiveSessionState = {
  activeSession: StreamSession | null;
  lastCompletedSession: StreamSession | null;
  status: LiveSessionStatus;
};

export type UseLiveSessionResult = LiveSessionState & {
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
};

export function useLiveSession(): UseLiveSessionResult {
  const [activeSession, setActiveSession] = useState<StreamSession | null>(null);
  const [lastCompletedSession, setLastCompletedSession] =
    useState<StreamSession | null>(null);

  const startSession = useCallback(async () => {
    const now = new Date().toISOString();
    setActiveSession(createStreamSession(now));
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

      return null;
    });
  }, []);

  return {
    activeSession,
    lastCompletedSession,
    status: activeSession === null ? "ready" : "running",
    startSession,
    stopSession,
  };
}
