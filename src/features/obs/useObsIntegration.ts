import { useEffect, useEffectEvent, useRef, useState } from "react";
import type { AppSettings } from "../../domain/settings";
import {
  ObsConnectionController,
  type ObsConnectionState,
} from "../../services/obsConnection";
import type { ObsStreamState, ObsStreamStatus } from "../../services/obsClient";
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
  const controllerRef = useRef<ObsConnectionController | null>(null);
  const activeControlSourceRef = useRef(
    liveSession.activeSession?.controlSource ?? null,
  );
  const obsStreamingRef = useRef(false);
  const manualStopSuppressedRef = useRef(false);
  const isLiveSessionLoaded = liveSession.status !== "loading";
  const onManualSessionStop = liveSession.onManualSessionStop;

  useEffect(() => {
    activeControlSourceRef.current =
      liveSession.activeSession?.controlSource ?? null;
  }, [liveSession.activeSession]);

  const handleStreamState = useEffectEvent(
    (streamState: ObsStreamState | ObsStreamStatus) => {
      obsStreamingRef.current = streamState.outputActive;
      const action = getObsSessionAction(
        streamState,
        activeControlSourceRef.current,
        manualStopSuppressedRef.current,
      );

      if (action.type === "start") {
        activeControlSourceRef.current = "obs";
        const startedAt = new Date(
          Date.now() - action.outputDuration,
        ).toISOString();
        void liveSession.startSessionFromObs(startedAt);
      } else if (action.type === "adopt") {
        activeControlSourceRef.current = "obs";
        void liveSession.adoptSessionForObs();
      } else if (action.type === "stop") {
        activeControlSourceRef.current = null;
        manualStopSuppressedRef.current = false;
        void liveSession.stopSessionFromObs(action.showReconciliationNotice);
      } else if (!streamState.outputActive) {
        manualStopSuppressedRef.current = false;
      }
    },
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
    return onManualSessionStop(() => {
      if (obsStreamingRef.current) {
        manualStopSuppressedRef.current = true;
        activeControlSourceRef.current = null;
      }
    });
  }, [onManualSessionStop]);

  useEffect(() => {
    const controller = new ObsConnectionController({
      onStateChange: setConnectionState,
      onStreamState: handleStreamState,
    });
    controllerRef.current = controller;

    if (settings === null || !settings.obsEnabled || !isLiveSessionLoaded) {
      controller.stop();
    } else {
      controller.start({
        host: settings.obsHost,
        password: settings.obsPassword,
        port: settings.obsPort,
      });
    }

    return () => {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
      }

      controller.stop();
    };
  }, [isLiveSessionLoaded, settings]);

  return {
    enabled: settings?.obsEnabled ?? false,
    message: getConnectionMessage(connectionState),
    retry: () => controllerRef.current?.retry(),
    state: connectionState,
  };
}
