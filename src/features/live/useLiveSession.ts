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
  countTimestampMarksForSession,
  listTimestampMarksForSession,
  saveTimestampMark,
} from "../../services/marksRepository";
import {
  DEFAULT_ADD_MARK_HOTKEY,
  DEFAULT_START_STOP_HOTKEY,
  getOrCreateAppSettings,
} from "../../services/settingsRepository";
import { subscribeToAppSettingsChanges } from "../../services/settingsEvents";
import {
  deleteStreamSession,
  getActiveStreamSession,
  listActiveStreamSessions,
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
  isSessionTransitionPending: boolean;
  marks: TimestampMark[];
  noticeMessage: string | null;
  status: LiveSessionStatus;
};

export type UseLiveSessionResult = LiveSessionState & {
  addMark: () => Promise<void>;
  setHotkeysSuspended: (isSuspended: boolean) => void;
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

async function completeStaleActiveSessions(
  keepSessionId: string | null,
): Promise<void> {
  const now = new Date().toISOString();
  const activeSessions = await listActiveStreamSessions();

  for (const session of activeSessions) {
    if (session.id === keepSessionId) {
      continue;
    }

    const markCount = await countTimestampMarksForSession(session.id);

    if (markCount === 0) {
      await deleteStreamSession(session.id);
    } else {
      await saveStreamSession(completeStreamSession(session, now));
    }
  }
}

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
  const [hotkeysSuspended, setHotkeysSuspendedState] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionTransitionPending, setIsSessionTransitionPending] =
    useState(false);
  const [lastCompletedSession, setLastCompletedSession] =
    useState<StreamSession | null>(null);
  const [marks, setMarks] = useState<TimestampMark[]>([]);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const activeSessionRef = useRef<StreamSession | null>(null);
  const addMarkRef = useRef<() => Promise<void>>(async () => undefined);
  const hotkeysSuspendedRef = useRef(false);
  const hotkeyRegistrationTaskRef = useRef<Promise<void>>(Promise.resolve());
  const registeredHotkeysRef = useRef<RegisteredHotkeys | null>(null);
  const sessionTransitionPendingRef = useRef(false);
  const startSessionRef = useRef<() => Promise<void>>(async () => undefined);
  const stopSessionRef = useRef<() => Promise<void>>(async () => undefined);

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

  const setHotkeysSuspended = useCallback((isSuspended: boolean) => {
    hotkeysSuspendedRef.current = isSuspended;
    setHotkeysSuspendedState(isSuspended);
  }, []);

  useEffect(() => {
    let isCurrent = true;

    async function recoverActiveSession() {
      try {
        const recoveredSession = await getActiveStreamSession();

        if (!isCurrent) {
          return;
        }

        if (recoveredSession !== null) {
          await completeStaleActiveSessions(recoveredSession.id);
        }

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
    return subscribeToAppSettingsChanges((settings) => {
      setHotkeys({
        addMarkHotkey: settings.addMarkHotkey,
        startStopHotkey: settings.startStopHotkey,
      });
    });
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
    if (sessionTransitionPendingRef.current) {
      return;
    }

    sessionTransitionPendingRef.current = true;
    setIsSessionTransitionPending(true);

    try {
      const now = new Date().toISOString();

      await completeStaleActiveSessions(null);

      const session = createStreamSession(now);

      await saveStreamSession(session);
      setActiveSession(session);
      setElapsedMs(0);
      setErrorMessage(null);
      setLastCompletedSession(null);
      setMarks([]);
      setNoticeMessage(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save stream");
    } finally {
      sessionTransitionPendingRef.current = false;
      setIsSessionTransitionPending(false);
    }
  }, []);

  const stopSession = useCallback(async () => {
    const now = new Date().toISOString();
    const currentSession = activeSession;

    if (currentSession === null) {
      return;
    }

    if (sessionTransitionPendingRef.current) {
      return;
    }

    sessionTransitionPendingRef.current = true;
    setIsSessionTransitionPending(true);

    try {
      const markCount = await countTimestampMarksForSession(currentSession.id);

      if (markCount === 0) {
        await deleteStreamSession(currentSession.id);
        setLastCompletedSession(null);
        setElapsedMs(0);
        setErrorMessage(null);
        setActiveSession(null);
        setMarks([]);
        setNoticeMessage("Stream not saved because no marks were added");
        return;
      }

      const completedSession = completeStreamSession(currentSession, now);

      await saveStreamSession(completedSession);
      setLastCompletedSession(completedSession);
      setElapsedMs(0);
      setErrorMessage(null);
      setActiveSession(null);
      setNoticeMessage(null);
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not save stream");
    } finally {
      sessionTransitionPendingRef.current = false;
      setIsSessionTransitionPending(false);
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
      if (hotkeysSuspended) {
        return;
      }

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
                if (hotkeysSuspendedRef.current) {
                  return;
                }

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
                if (hotkeysSuspendedRef.current) {
                  return;
                }

                void addMarkRef.current();
              });

        if (currentRegistration?.addMarkCleanup !== addMarkCleanup) {
          pendingCleanups.push(addMarkCleanup);
        }

        if (!isCurrent) {
          await Promise.allSettled(pendingCleanups.map((cleanup) => cleanup()));
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

        await Promise.allSettled(pendingCleanups.map((cleanup) => cleanup()));

        if (currentRegistration !== null) {
          setHotkeys({
            addMarkHotkey: currentRegistration.addMarkHotkey,
            startStopHotkey: currentRegistration.startStopHotkey,
          });
        }

        setErrorMessage("Shortcut unavailable");
      }
    }

    // React Strict Mode remounts effects in development. Serializing native
    // registration prevents the remount from racing the canceled first pass.
    hotkeyRegistrationTaskRef.current = hotkeyRegistrationTaskRef.current.then(
      registerHotkeys,
      registerHotkeys,
    );

    return () => {
      isCurrent = false;

      hotkeyRegistrationTaskRef.current =
        hotkeyRegistrationTaskRef.current.then(async () => {
          const currentRegistration = registeredHotkeysRef.current;

          if (currentRegistration === null) {
            return;
          }

          registeredHotkeysRef.current = null;
          await Promise.allSettled([
            currentRegistration.addMarkCleanup(),
            currentRegistration.startStopCleanup(),
          ]);
        });
    };
  }, [hotkeys.addMarkHotkey, hotkeys.startStopHotkey, hotkeysSuspended]);

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
    isSessionTransitionPending,
    lastCompletedSession,
    marks,
    noticeMessage,
    setHotkeysSuspended,
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
