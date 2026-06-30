import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiveSessionContext } from "./liveSessionContext";
import { LiveView } from "./LiveView";
import { ObsIntegrationContext } from "../obs/obsIntegrationContext";

const obsValue = {
  enabled: false,
  message: null,
  retry: vi.fn(),
  state: "disabled" as const,
};

describe("LiveView", () => {
  it("explains why an empty stream was not saved", () => {
    render(
      <LiveSessionContext.Provider
        value={{
          activeSession: null,
          addMark: vi.fn(),
          adoptSessionForObs: vi.fn(),
          elapsedMs: 0,
          errorMessage: null,
          hotkeys: {
            addMarkHotkey: "F10",
            startStopHotkey: "F9",
          },
          isSessionTransitionPending: false,
          lastCompletedSession: null,
          marks: [],
          noticeMessage: "Stream not saved because no marks were added",
          onManualSessionStop: vi.fn(() => () => undefined),
          setHotkeysSuspended: vi.fn(),
          startSession: vi.fn(),
          startSessionFromObs: vi.fn(),
          status: "ready",
          stopSession: vi.fn(),
          stopSessionFromObs: vi.fn(),
        }}
      >
        <ObsIntegrationContext.Provider value={obsValue}>
          <LiveView />
        </ObsIntegrationContext.Provider>
      </LiveSessionContext.Provider>,
    );

    expect(
      screen.getByText("Stream not saved because no marks were added"),
    ).toBeTruthy();
  });

  it("shows the stop stream action in red", () => {
    render(
      <LiveSessionContext.Provider
        value={{
          activeSession: {
            id: "session-1",
            title: null,
            startedAt: "2026-06-30T15:00:00.000Z",
            endedAt: null,
            durationMs: null,
            status: "active",
            controlSource: "manual",
            createdAt: "2026-06-30T15:00:00.000Z",
            updatedAt: "2026-06-30T15:00:00.000Z",
          },
          addMark: vi.fn(),
          adoptSessionForObs: vi.fn(),
          elapsedMs: 0,
          errorMessage: null,
          hotkeys: {
            addMarkHotkey: "F10",
            startStopHotkey: "F9",
          },
          isSessionTransitionPending: false,
          lastCompletedSession: null,
          marks: [],
          noticeMessage: null,
          onManualSessionStop: vi.fn(() => () => undefined),
          setHotkeysSuspended: vi.fn(),
          startSession: vi.fn(),
          startSessionFromObs: vi.fn(),
          status: "running",
          stopSession: vi.fn(),
          stopSessionFromObs: vi.fn(),
        }}
      >
        <ObsIntegrationContext.Provider value={obsValue}>
          <LiveView />
        </ObsIntegrationContext.Provider>
      </LiveSessionContext.Provider>,
    );

    expect(
      screen.getByRole("button", { name: "Stop stream" }).className,
    ).toContain("button-danger");
  });

  it("shows OBS connection status without replacing stream status", () => {
    render(
      <LiveSessionContext.Provider
        value={{
          activeSession: null,
          addMark: vi.fn(),
          adoptSessionForObs: vi.fn(),
          elapsedMs: 0,
          errorMessage: null,
          hotkeys: { addMarkHotkey: "F10", startStopHotkey: "F9" },
          isSessionTransitionPending: false,
          lastCompletedSession: null,
          marks: [],
          noticeMessage: null,
          onManualSessionStop: vi.fn(() => () => undefined),
          setHotkeysSuspended: vi.fn(),
          startSession: vi.fn(),
          startSessionFromObs: vi.fn(),
          status: "ready",
          stopSession: vi.fn(),
          stopSessionFromObs: vi.fn(),
        }}
      >
        <ObsIntegrationContext.Provider
          value={{
            enabled: true,
            message: "OBS disconnected",
            retry: vi.fn(),
            state: "disconnected",
          }}
        >
          <LiveView />
        </ObsIntegrationContext.Provider>
      </LiveSessionContext.Provider>,
    );

    expect(screen.getByText("Ready")).toBeTruthy();
    expect(screen.getByText("OBS disconnected")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
  });
});
