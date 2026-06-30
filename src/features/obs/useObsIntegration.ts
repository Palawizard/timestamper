import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppSettings } from "../../domain/settings";
import {
  ObsConnectionController,
  type ObsConnectionState,
} from "../../services/obsConnection";
import { getOrCreateAppSettings } from "../../services/settingsRepository";
import { subscribeToAppSettingsChanges } from "../../services/settingsEvents";
import type { UseLiveSessionResult } from "../live/useLiveSession";
import type { ObsIntegrationContextValue } from "./obsIntegrationContext";
import { getObsSessionAction } from "./obsOrchestration";

function getConnectionMessage(state: ObsConnectionState): string | null {
  switch (state) {
    case "connecting":
      return "Connecting to OBS";
    case "connected":
      return "OBS connected";
    case "streaming":
      return "OBS stream detected";
    case "disconnected":
      return "OBS disconnected";
    case "authentication-failed":
      return "OBS authentication failed";
    case "error":
      return "Could not connect to OBS";
    case "disabled":
      return null;
  }
}

export function useObsIntegration(
  liveSession: UseLiveSessionResult,
): ObsIntegrationContextValue {
  const [connectionState, setConnectionState] =
    useState<ObsConnectionState>("disabled");
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const activeSessionRef = useRef(liveSession.activeSession);
  const liveSessionRef = useRef(liveSession);
  const obsStreamingRef = useRef(false);
  const manualStopSuppressedRef = useRef(false);
  const isLiveSessionLoaded = liveSession.status !== "loading";

  activeSessionRef.current = liveSession.activeSession;
  liveSessionRef.current = liveSession;

  const controller = useMemo(
    () =>
      new ObsConnectionController({
        onStateChange: setConnectionState,
        onStreamState: (streamState) => {
          if (streamState.outputActive) {
            obsStreamingRef.current = true;
          } else {
            obsStreamingRef.current = false;
          }

          const currentSession = activeSessionRef.current;
          const action = getObsSessionAction(
            streamState,
            currentSession?.controlSource ?? null,
            manualStopSuppressedRef.current,
          );

          if (action.type === "start") {
            const startedAt = new Date(
              Date.now() - action.outputDuration,
            ).toISOString();
            void liveSessionRef.current.startSessionFromObs(startedAt);
          } else if (action.type === "adopt") {
            void liveSessionRef.current.adoptSessionForObs();
          } else if (action.type === "stop") {
            manualStopSuppressedRef.current = false;
            void liveSessionRef.current.stopSessionFromObs(
              action.showReconciliationNotice,
            );
          } else if (!streamState.outputActive) {
            manualStopSuppressedRef.current = false;
          }
        },
      }),
    [],
  );

  useEffect(() => {
    let isCurrent = true;

    void getOrCreateAppSettings()
      .then((savedSettings) => {
        if (isCurrent) {
          setSettings(savedSettings);
        }
      })
      .catch(() => {
        if (isCurrent) {
          setConnectionState("error");
        }
      });

    const unsubscribe = subscribeToAppSettingsChanges(setSettings);

    return () => {
      isCurrent = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    return liveSession.onManualSessionStop(() => {
      if (obsStreamingRef.current) {
        manualStopSuppressedRef.current = true;
      }
    });
  }, [liveSession.onManualSessionStop]);

  useEffect(() => {
    if (settings === null || !settings.obsEnabled || !isLiveSessionLoaded) {
      controller.stop();
      return;
    }

    controller.start({
      host: settings.obsHost,
      password: settings.obsPassword,
      port: settings.obsPort,
    });

    return () => controller.stop();
  }, [
    controller,
    isLiveSessionLoaded,
    settings?.obsEnabled,
    settings?.obsHost,
    settings?.obsPassword,
    settings?.obsPort,
  ]);

  useEffect(() => () => controller.stop(), [controller]);

  const retry = useCallback(() => controller.retry(), [controller]);

  return {
    enabled: settings?.obsEnabled ?? false,
    message: getConnectionMessage(connectionState),
    retry,
    state: connectionState,
  };
}
