import { useCallback, useEffect, useState } from "react";
import type { StreamSession } from "../../domain/streamSession";
import type { TimestampMark } from "../../domain/timestampMark";
import { calculateElapsedMs } from "../../domain/timeDuration";
import { listTimestampMarksForSession } from "../../services/marksRepository";
import { saveStreamSession } from "../../services/sessionsRepository";
import { completeStreamSession, createStreamSession } from "./liveSession";

export type LiveSessionStatus = "ready" | "running" | "error";

export type LiveSessionState = {
  activeSession: StreamSession | null;
  elapsedMs: number;
  errorMessage: string | null;
  lastCompletedSession: StreamSession | null;
  marks: TimestampMark[];
  status: LiveSessionStatus;
};

export type UseLiveSessionResult = LiveSessionState & {
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
};

export function useLiveSession(): UseLiveSessionResult {
  const [activeSession, setActiveSession] = useState<StreamSession | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastCompletedSession, setLastCompletedSession] =
    useState<StreamSession | null>(null);
  const [marks, setMarks] = useState<TimestampMark[]>([]);

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
    try {
      const now = new Date().toISOString();
      const session = createStreamSession(now);

      await saveStreamSession(session);
      setActiveSession(session);
      setElapsedMs(0);
      setErrorMessage(null);
      setLastCompletedSession(null);
      setMarks([]);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save stream");
    }
  }, []);

  const stopSession = useCallback(async () => {
    const now = new Date().toISOString();
    const currentSession = activeSession;

    if (currentSession === null) {
      return;
    }

    try {
      const completedSession = completeStreamSession(currentSession, now);

      await saveStreamSession(completedSession);
      setLastCompletedSession(completedSession);
      setElapsedMs(0);
      setErrorMessage(null);
      setActiveSession(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save stream");
    }
  }, [activeSession]);

  useEffect(() => {
    let isCurrent = true;

    async function loadMarks() {
      if (activeSession === null) {
        setMarks([]);
        return;
      }

      try {
        const sessionMarks = await listTimestampMarksForSession(
          activeSession.id,
        );

        if (isCurrent) {
          setMarks(sessionMarks);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error(error);

        if (isCurrent) {
          setErrorMessage("Could not load marks");
        }
      }
    }

    void loadMarks();

    return () => {
      isCurrent = false;
    };
  }, [activeSession]);

  return {
    activeSession,
    elapsedMs,
    errorMessage,
    lastCompletedSession,
    marks,
    status:
      errorMessage !== null
        ? "error"
        : activeSession === null
          ? "ready"
          : "running",
    startSession,
    stopSession,
  };
}
