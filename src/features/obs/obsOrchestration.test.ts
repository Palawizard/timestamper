import { describe, expect, it } from "vitest";
import { getObsSessionAction } from "./obsOrchestration";

const started = {
  outputActive: true,
  outputState: "OBS_WEBSOCKET_OUTPUT_STARTED",
};

describe("OBS session orchestration", () => {
  it("starts an OBS session when no session is active", () => {
    expect(getObsSessionAction(started, null, false)).toEqual({
      type: "start",
      outputDuration: 0,
    });
  });

  it("backdates a session from a status snapshot", () => {
    expect(
      getObsSessionAction(
        { ...started, outputDuration: 42_000, outputReconnecting: false },
        null,
        false,
      ),
    ).toEqual({ type: "start", outputDuration: 42_000 });
  });

  it("adopts a manual session without restarting it", () => {
    expect(getObsSessionAction(started, "manual", false)).toEqual({
      type: "adopt",
    });
  });

  it("deduplicates starts for an OBS session", () => {
    expect(getObsSessionAction(started, "obs", false)).toEqual({
      type: "none",
    });
  });

  it("ignores reconnect transitions", () => {
    expect(
      getObsSessionAction(
        {
          outputActive: true,
          outputState: "OBS_WEBSOCKET_OUTPUT_RECONNECTING",
        },
        "obs",
        false,
      ),
    ).toEqual({ type: "none" });
  });

  it("stops only an OBS-managed session", () => {
    const stopped = {
      outputActive: false,
      outputState: "OBS_WEBSOCKET_OUTPUT_STOPPED",
    };

    expect(getObsSessionAction(stopped, "obs", false)).toEqual({
      type: "stop",
      showReconciliationNotice: false,
    });
    expect(getObsSessionAction(stopped, "manual", false)).toEqual({
      type: "none",
    });
  });

  it("marks a missed stop found by reconciliation", () => {
    expect(
      getObsSessionAction(
        {
          outputActive: false,
          outputDuration: 0,
          outputReconnecting: false,
          outputState: "OBS_WEBSOCKET_OUTPUT_STOPPED",
        },
        "obs",
        false,
      ),
    ).toEqual({ type: "stop", showReconciliationNotice: true });
  });

  it("does not restart after a manual stop during the current OBS run", () => {
    expect(getObsSessionAction(started, null, true)).toEqual({ type: "none" });
  });
});
