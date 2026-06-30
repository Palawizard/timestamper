import type { StreamSessionControlSource } from "../../domain/streamSession";
import type { ObsStreamState, ObsStreamStatus } from "../../services/obsClient";

export type ObsSessionAction =
  | { type: "none" }
  | { type: "start"; outputDuration: number }
  | { type: "adopt" }
  | { type: "stop"; showReconciliationNotice: boolean };

function isStatusSnapshot(
  state: ObsStreamState | ObsStreamStatus,
): state is ObsStreamStatus {
  return "outputDuration" in state;
}

function isReconnectTransition(outputState: string): boolean {
  return (
    outputState === "OBS_WEBSOCKET_OUTPUT_RECONNECTING" ||
    outputState === "OBS_WEBSOCKET_OUTPUT_RECONNECTED"
  );
}

export function getObsSessionAction(
  state: ObsStreamState | ObsStreamStatus,
  activeControlSource: StreamSessionControlSource | null,
  manualStopSuppressed: boolean,
): ObsSessionAction {
  if (isReconnectTransition(state.outputState)) {
    return { type: "none" };
  }

  if (state.outputActive) {
    if (manualStopSuppressed) {
      return { type: "none" };
    }

    if (activeControlSource === null) {
      return {
        type: "start",
        outputDuration: isStatusSnapshot(state)
          ? Math.max(0, state.outputDuration)
          : 0,
      };
    }

    return activeControlSource === "manual"
      ? { type: "adopt" }
      : { type: "none" };
  }

  return activeControlSource === "obs"
    ? {
        type: "stop",
        showReconciliationNotice: isStatusSnapshot(state),
      }
    : { type: "none" };
}
