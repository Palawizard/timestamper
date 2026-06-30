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
});
