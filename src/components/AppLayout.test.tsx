import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiveSessionContext } from "../features/live/liveSessionContext";
import { AppLayout } from "./AppLayout";

describe("AppLayout", () => {
  it("keeps the active stream visible outside the Live view", () => {
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
          elapsedMs: 65_000,
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
        <AppLayout activeRoute="history" onRouteChange={vi.fn()}>
          <p>History content</p>
        </AppLayout>
      </LiveSessionContext.Provider>,
    );

    expect(screen.getByText("Stream running")).toBeTruthy();
    expect(screen.getByText("00:01:05")).toBeTruthy();
    expect(screen.getByText("History content")).toBeTruthy();
  });
});
