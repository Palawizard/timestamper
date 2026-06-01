import { useCallback, useEffect, useState } from "react";
import type { StreamSession } from "../../domain/streamSession";
import type { TimestampMark } from "../../domain/timestampMark";
import { calculateElapsedMs } from "../../domain/timeDuration";
import {
  listTimestampMarksForSession,
  saveTimestampMark,
} from "../../services/marksRepository";
import {
  getActiveStreamSession,
  saveStreamSession,
} from "../../services/sessionsRepository";
import {
  completeStreamSession,
  createStreamSession,
  createTimestampMark,
} from "./liveSession";

export type LiveSessionStatus = "loading" | "ready" | "running" | "error";

export type LiveSessionState = {
  activeSession: StreamSession | null;
  elapsedMs: number;
  errorMessage: string | null;
  lastCompletedSession: StreamSession | null;
  marks: TimestampMark[];
  status: LiveSessionStatus;
};

export type UseLiveSessionResult = LiveSessionState & {
  addMark: () => Promise<void>;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
};

export function useLiveSession(): UseLiveSessionResult {
  const [activeSession, setActiveSession] = useState<StreamSession | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [lastCompletedSession, setLastCompletedSession] =
    useState<StreamSession | null>(null);
  const [marks, setMarks] = useState<TimestampMark[]>([]);

  useEffect(() => {
    let isCurrent = true;

    async function recoverActiveSession() {
      try {
        const recoveredSession = await getActiveStreamSession();

        if (!isCurrent) {
          return;
        }

        setActiveSession(recoveredSession);
        setElapsedMs(
          recoveredSession === null
            ? 0
            : calculateElapsedMs(
                Date.parse(recoveredSession.startedAt),
                Date.now(),
              ),
        );
        setErrorMessage(null);
      } catch (error) {
        console.error(error);

        if (isCurrent) {
          setErrorMessage("Could not load active stream");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void recoverActiveSession();

    return () => {
      isCurrent = false;
    };
  }, []);

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

  const addMark = useCallback(async () => {
    const currentSession = activeSession;

    if (currentSession === null) {
      setErrorMessage("Start a stream first");
      return;
    }

    const now = new Date().toISOString();
    const mark = createTimestampMark(currentSession, now);

    try {
      await saveTimestampMark(mark);
      setMarks((currentMarks) => [...currentMarks, mark]);
      setErrorMessage(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save mark");
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
    addMark,
    activeSession,
    elapsedMs,
    errorMessage,
    lastCompletedSession,
    marks,
    status:
      errorMessage !== null
        ? "error"
        : isLoading
          ? "loading"
          : activeSession === null
            ? "ready"
            : "running",
    startSession,
    stopSession,
  };
}
