import { useCallback, useEffect, useRef, useState } from "react";
import type { AppSettings } from "../../domain/settings";
import type { StreamSession } from "../../domain/streamSession";
import type { TimestampMark } from "../../domain/timestampMark";
import { calculateElapsedMs } from "../../domain/timeDuration";
import {
  registerAddMarkHotkey,
  registerStartStopHotkey,
  type HotkeyCleanup,
} from "../../services/hotkeys";
import {
  listTimestampMarksForSession,
  saveTimestampMark,
} from "../../services/marksRepository";
import {
  DEFAULT_ADD_MARK_HOTKEY,
  DEFAULT_START_STOP_HOTKEY,
  getOrCreateAppSettings,
} from "../../services/settingsRepository";
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
  hotkeys: Pick<AppSettings, "addMarkHotkey" | "startStopHotkey">;
  lastCompletedSession: StreamSession | null;
  marks: TimestampMark[];
  status: LiveSessionStatus;
};

export type UseLiveSessionResult = LiveSessionState & {
  addMark: () => Promise<void>;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
};

type RegisteredHotkeys = Pick<
  AppSettings,
  "addMarkHotkey" | "startStopHotkey"
> & {
  addMarkCleanup: HotkeyCleanup;
  startStopCleanup: HotkeyCleanup;
};

export function useLiveSession(): UseLiveSessionResult {
  const [activeSession, setActiveSession] = useState<StreamSession | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [hotkeys, setHotkeys] = useState<
    Pick<AppSettings, "addMarkHotkey" | "startStopHotkey">
  >({
    addMarkHotkey: DEFAULT_ADD_MARK_HOTKEY,
    startStopHotkey: DEFAULT_START_STOP_HOTKEY,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastCompletedSession, setLastCompletedSession] =
    useState<StreamSession | null>(null);
  const [marks, setMarks] = useState<TimestampMark[]>([]);
  const activeSessionRef = useRef<StreamSession | null>(null);
  const addMarkRef = useRef<() => Promise<void>>(async () => undefined);
  const registeredHotkeysRef = useRef<RegisteredHotkeys | null>(null);
  const startSessionRef = useRef<() => Promise<void>>(async () => undefined);
  const stopSessionRef = useRef<() => Promise<void>>(async () => undefined);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

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
    let isCurrent = true;

    async function loadSettings() {
      try {
        const savedSettings = await getOrCreateAppSettings();

        if (isCurrent) {
          setHotkeys({
            addMarkHotkey: savedSettings.addMarkHotkey,
            startStopHotkey: savedSettings.startStopHotkey,
          });
          setErrorMessage(null);
        }
      } catch (error) {
        console.error(error);

        if (isCurrent) {
          setErrorMessage("Could not load settings");
        }
      }
    }

    void loadSettings();

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
    addMarkRef.current = addMark;
    startSessionRef.current = startSession;
    stopSessionRef.current = stopSession;
  }, [addMark, startSession, stopSession]);

  useEffect(() => {
    let isCurrent = true;

    async function registerHotkeys() {
      const currentRegistration = registeredHotkeysRef.current;

      if (
        currentRegistration?.addMarkHotkey === hotkeys.addMarkHotkey &&
        currentRegistration.startStopHotkey === hotkeys.startStopHotkey
      ) {
        return;
      }

      const pendingCleanups: HotkeyCleanup[] = [];

      try {
        const startStopCleanup =
          currentRegistration?.startStopHotkey === hotkeys.startStopHotkey
            ? currentRegistration.startStopCleanup
            : await registerStartStopHotkey(hotkeys.startStopHotkey, () => {
                if (activeSessionRef.current === null) {
                  void startSessionRef.current();
                  return;
                }

                void stopSessionRef.current();
              });

        if (currentRegistration?.startStopCleanup !== startStopCleanup) {
          pendingCleanups.push(startStopCleanup);
        }

        const addMarkCleanup =
          currentRegistration?.addMarkHotkey === hotkeys.addMarkHotkey
            ? currentRegistration.addMarkCleanup
            : await registerAddMarkHotkey(hotkeys.addMarkHotkey, () => {
                void addMarkRef.current();
              });

        if (currentRegistration?.addMarkCleanup !== addMarkCleanup) {
          pendingCleanups.push(addMarkCleanup);
        }

        if (!isCurrent) {
          for (const cleanup of pendingCleanups) {
            void cleanup();
          }
          return;
        }

        if (
          currentRegistration !== null &&
          currentRegistration.startStopCleanup !== startStopCleanup
        ) {
          void currentRegistration.startStopCleanup();
        }

        if (
          currentRegistration !== null &&
          currentRegistration.addMarkCleanup !== addMarkCleanup
        ) {
          void currentRegistration.addMarkCleanup();
        }

        registeredHotkeysRef.current = {
          addMarkCleanup,
          addMarkHotkey: hotkeys.addMarkHotkey,
          startStopCleanup,
          startStopHotkey: hotkeys.startStopHotkey,
        };
        setErrorMessage(null);
      } catch (error) {
        console.error(error);

        for (const cleanup of pendingCleanups) {
          void cleanup();
        }

        setErrorMessage("Shortcut unavailable");
      }
    }

    void registerHotkeys();

    return () => {
      isCurrent = false;
    };
  }, [hotkeys.addMarkHotkey, hotkeys.startStopHotkey]);

  useEffect(() => {
    return () => {
      const currentRegistration = registeredHotkeysRef.current;

      if (currentRegistration === null) {
        return;
      }

      void currentRegistration.addMarkCleanup();
      void currentRegistration.startStopCleanup();
      registeredHotkeysRef.current = null;
    };
  }, []);

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
    hotkeys,
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
