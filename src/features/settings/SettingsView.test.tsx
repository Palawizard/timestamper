import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { LiveSessionContext } from "../live/liveSessionContext";
import { SettingsView } from "./SettingsView";
import { ObsIntegrationContext } from "../obs/obsIntegrationContext";

const {
  getOrCreateAppSettings,
  isObsAuthenticationError,
  saveAppSettings,
  testObsConnection,
} = vi.hoisted(() => ({
  getOrCreateAppSettings: vi.fn(),
  isObsAuthenticationError: vi.fn(),
  saveAppSettings: vi.fn(),
  testObsConnection: vi.fn(),
}));

vi.mock("../../services/settingsRepository", () => ({
  DEFAULT_ADD_MARK_HOTKEY: "F10",
  DEFAULT_START_STOP_HOTKEY: "F9",
  getOrCreateAppSettings,
  saveAppSettings,
}));

vi.mock("../../services/obsClient", () => ({
  isObsAuthenticationError,
  testObsConnection,
}));

vi.mock("../../services/settingsEvents", () => ({
  notifyAppSettingsChanged: vi.fn(),
  subscribeToAppSettingsChanges: vi.fn(() => () => undefined),
}));

const liveSessionValue = {
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
  status: "ready" as const,
  stopSession: vi.fn(),
  stopSessionFromObs: vi.fn(),
};

const obsValue = {
  enabled: false,
  message: null,
  retry: vi.fn(),
  state: "disabled" as const,
};

describe("SettingsView", () => {
  beforeEach(() => {
    getOrCreateAppSettings.mockReset();
    saveAppSettings.mockReset();
    testObsConnection.mockReset();
    isObsAuthenticationError.mockReset().mockReturnValue(false);
  });

  function renderSettings() {
    return render(
      <LiveSessionContext.Provider value={liveSessionValue}>
        <ObsIntegrationContext.Provider value={obsValue}>
          <SettingsView />
        </ObsIntegrationContext.Provider>
      </LiveSessionContext.Provider>,
    );
  }

  it("shows saved settings after loading", async () => {
    getOrCreateAppSettings.mockResolvedValue({
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      obsEnabled: false,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:00:00.000Z",
    });

    renderSettings();

    expect(await screen.findByRole("button", { name: "Save" })).toBeTruthy();
    expect(screen.getByLabelText("Start or stop stream")).toHaveProperty(
      "value",
      "F9",
    );
  });

  it("shows a retryable error instead of an editable fallback", async () => {
    getOrCreateAppSettings.mockRejectedValue(new Error("database unavailable"));

    renderSettings();

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Save" })).toBeNull();
  });

  it("keeps the OBS password masked and fields disabled until enabled", async () => {
    getOrCreateAppSettings.mockResolvedValue({
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      obsEnabled: false,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "secret",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:00:00.000Z",
    });

    renderSettings();

    const password = await screen.findByLabelText("Password");
    expect(password).toHaveProperty("type", "password");
    expect(password).toHaveProperty("disabled", true);
    expect(screen.getByLabelText("Enable OBS integration")).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("tests the edited OBS connection", async () => {
    getOrCreateAppSettings.mockResolvedValue({
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      obsEnabled: false,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "secret",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:00:00.000Z",
    });
    testObsConnection.mockResolvedValue({ outputActive: false });

    renderSettings();

    fireEvent.click(await screen.findByLabelText("Enable OBS integration"));
    fireEvent.click(screen.getByRole("button", { name: "Test connection" }));

    await waitFor(() => expect(testObsConnection).toHaveBeenCalledOnce());
    expect(await screen.findByText("OBS connected")).toBeTruthy();
  });

  it("requires a password before saving an enabled integration", async () => {
    getOrCreateAppSettings.mockResolvedValue({
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      obsEnabled: false,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:00:00.000Z",
    });

    renderSettings();

    fireEvent.click(await screen.findByLabelText("Enable OBS integration"));
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(await screen.findByText("Enter the OBS password")).toBeTruthy();
    expect(saveAppSettings).not.toHaveBeenCalled();
  });

  it("shows authentication failure without exposing the password", async () => {
    getOrCreateAppSettings.mockResolvedValue({
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      obsEnabled: true,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "private-password",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:00:00.000Z",
    });
    testObsConnection.mockRejectedValue({ code: 4009 });
    isObsAuthenticationError.mockReturnValue(true);

    renderSettings();

    fireEvent.click(
      await screen.findByRole("button", { name: "Test connection" }),
    );

    expect(await screen.findByText("Authentication failed")).toBeTruthy();
    expect(screen.queryByText("private-password")).toBeNull();
  });

  it("saves OBS settings with success feedback", async () => {
    getOrCreateAppSettings.mockResolvedValue({
      addMarkHotkey: "F10",
      startStopHotkey: "F9",
      timestampFormat: "hh:mm:ss",
      obsEnabled: false,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "",
      createdAt: "2026-06-30T15:00:00.000Z",
      updatedAt: "2026-06-30T15:00:00.000Z",
    });
    saveAppSettings.mockResolvedValue(undefined);

    renderSettings();
    fireEvent.click(await screen.findByRole("button", { name: "Save" }));

    await waitFor(() => expect(saveAppSettings).toHaveBeenCalledOnce());
    expect(saveAppSettings.mock.calls[0][0]).toMatchObject({
      obsEnabled: false,
      obsHost: "127.0.0.1",
      obsPort: 4455,
      obsPassword: "",
    });
    expect(await screen.findByText("Settings saved")).toBeTruthy();
  });
});
