import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LiveSessionContext } from "./liveSessionContext";
import { LiveView } from "./LiveView";

describe("LiveView", () => {
  it("explains why an empty stream was not saved", () => {
    render(
      <LiveSessionContext.Provider
        value={{
          activeSession: null,
          addMark: vi.fn(),
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
          setHotkeysSuspended: vi.fn(),
          startSession: vi.fn(),
          status: "ready",
          stopSession: vi.fn(),
        }}
      >
        <LiveView />
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
            createdAt: "2026-06-30T15:00:00.000Z",
            updatedAt: "2026-06-30T15:00:00.000Z",
          },
          addMark: vi.fn(),
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
          setHotkeysSuspended: vi.fn(),
          startSession: vi.fn(),
          status: "running",
          stopSession: vi.fn(),
        }}
      >
        <LiveView />
      </LiveSessionContext.Provider>,
    );

    expect(
      screen.getByRole("button", { name: "Stop stream" }).className,
    ).toContain("button-danger");
  });
});
