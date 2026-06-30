import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiveSessionContext } from "../live/liveSessionContext";
import { SettingsView } from "./SettingsView";

const { getOrCreateAppSettings } = vi.hoisted(() => ({
  getOrCreateAppSettings: vi.fn(),
}));

vi.mock("../../services/settingsRepository", () => ({
  DEFAULT_ADD_MARK_HOTKEY: "F10",
  DEFAULT_START_STOP_HOTKEY: "F9",
  getOrCreateAppSettings,
  saveAppSettings: vi.fn(),
}));

vi.mock("../../services/settingsEvents", () => ({
  notifyAppSettingsChanged: vi.fn(),
  subscribeToAppSettingsChanges: vi.fn(() => () => undefined),
}));

const liveSessionValue = {
  activeSession: null,
  addMark: vi.fn(),
  elapsedMs: 0,
  errorMessage: null,
  hotkeys: { addMarkHotkey: "F10", startStopHotkey: "F9" },
  isSessionTransitionPending: false,
  lastCompletedSession: null,
  marks: [],
  noticeMessage: null,
  setHotkeysSuspended: vi.fn(),
  startSession: vi.fn(),
  status: "ready" as const,
  stopSession: vi.fn(),
};

describe("SettingsView", () => {
  beforeEach(() => {
    getOrCreateAppSettings.mockReset();
  });

  it("shows saved settings after loading", async () => {
    getOrCreateAppSettings.mockResolvedValue({
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:00:00.000Z",
    });

    render(
      <LiveSessionContext.Provider value={liveSessionValue}>
        <SettingsView />
      </LiveSessionContext.Provider>,
    );

    expect(await screen.findByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByLabelText("Start or stop stream")).toHaveProperty(
      "value",
      "F9",
    );
  });

  it("shows a retryable error instead of an editable fallback", async () => {
    getOrCreateAppSettings.mockRejectedValue(new Error("database unavailable"));

    render(
      <LiveSessionContext.Provider value={liveSessionValue}>
        <SettingsView />
      </LiveSessionContext.Provider>,
    );

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });
});
