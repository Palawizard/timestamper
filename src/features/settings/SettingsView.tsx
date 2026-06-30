import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { HotkeyInput } from "../../components/HotkeyInput";
import { StatusPanel } from "../../components/StatusPanel";
import { useLiveSessionContext } from "../live/liveSessionContext";
import {
  DEFAULT_ADD_MARK_HOTKEY,
  DEFAULT_START_STOP_HOTKEY,
  getOrCreateAppSettings,
  saveAppSettings,
} from "../../services/settingsRepository";
import {
  notifyAppSettingsChanged,
  subscribeToAppSettingsChanges,
} from "../../services/settingsEvents";
import { validateHotkeys } from "./hotkeyValidation";
import {
  isObsAuthenticationError,
  testObsConnection,
} from "../../services/obsClient";
import { useObsIntegrationContext } from "../obs/obsIntegrationContext";
import { validateObsSettings } from "./obsSettingsValidation";

type Feedback = {
  message: string;
  tone: "error" | "success";
};

export function SettingsView() {
  const [addMarkHotkey, setAddMarkHotkey] = useState(DEFAULT_ADD_MARK_HOTKEY);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingObs, setIsTestingObs] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [savedSettings, setSavedSettings] = useState<Awaited<
    ReturnType<typeof getOrCreateAppSettings>
  > | null>(null);
  const [startStopHotkey, setStartStopHotkey] = useState(
    DEFAULT_START_STOP_HOTKEY,
  );
  const [obsEnabled, setObsEnabled] = useState(false);
  const [obsHost, setObsHost] = useState("127.0.0.1");
  const [obsPassword, setObsPassword] = useState("");
  const [obsPort, setObsPort] = useState(4455);
  const [obsFeedback, setObsFeedback] = useState<Feedback | null>(null);
  const { setHotkeysSuspended } = useLiveSessionContext();
  const obsIntegration = useObsIntegrationContext();

  useEffect(() => {
    return () => setHotkeysSuspended(false);
  }, [setHotkeysSuspended]);

  useEffect(() => {
    let isCurrent = true;

    async function loadSettings() {
      setIsLoading(true);

      try {
        const settings = await getOrCreateAppSettings();

        if (isCurrent) {
          setSavedSettings(settings);
          setAddMarkHotkey(settings.addMarkHotkey);
          setStartStopHotkey(settings.startStopHotkey);
          setObsEnabled(settings.obsEnabled);
          setObsHost(settings.obsHost);
          setObsPassword(settings.obsPassword);
          setObsPort(settings.obsPort);
          setFeedback(null);
        }
      } catch (error) {
        console.error(error);

        if (isCurrent) {
          setSavedSettings(null);
          setFeedback({ message: "Could not load settings", tone: "error" });
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt]);

  useEffect(() => {
    return subscribeToAppSettingsChanges((settings) => {
      setSavedSettings(settings);
      setAddMarkHotkey(settings.addMarkHotkey);
      setStartStopHotkey(settings.startStopHotkey);
      setObsEnabled(settings.obsEnabled);
      setObsHost(settings.obsHost);
      setObsPassword(settings.obsPassword);
      setObsPort(settings.obsPort);
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading || isSaving) {
      return;
    }

    const validation = validateHotkeys(startStopHotkey, addMarkHotkey);

    if (!validation.isValid) {
      setFeedback({ message: validation.message, tone: "error" });
      return;
    }

    const obsValidation = validateObsSettings(
      obsEnabled,
      obsHost,
      obsPort,
      obsPassword,
    );

    if (!obsValidation.isValid) {
      setFeedback({ message: obsValidation.message, tone: "error" });
      return;
    }

    try {
      setIsSaving(true);
      const now = new Date().toISOString();
      const nextSettings = {
        ...(savedSettings ?? (await getOrCreateAppSettings())),
        addMarkHotkey: validation.values.addMarkHotkey,
        startStopHotkey: validation.values.startStopHotkey,
        obsEnabled: obsValidation.values.enabled,
        obsHost: obsValidation.values.host,
        obsPassword: obsValidation.values.password,
        obsPort: obsValidation.values.port,
        updatedAt: now,
      };

      await saveAppSettings(nextSettings);
      notifyAppSettingsChanged(nextSettings);
      setSavedSettings(nextSettings);
      setAddMarkHotkey(nextSettings.addMarkHotkey);
      setStartStopHotkey(nextSettings.startStopHotkey);
      setFeedback({ message: "Settings saved", tone: "success" });
    } catch (error) {
      console.error(error);
      setFeedback({ message: "Could not save settings", tone: "error" });
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    if (savedSettings === null) {
      return;
    }

    setAddMarkHotkey(savedSettings.addMarkHotkey);
    setStartStopHotkey(savedSettings.startStopHotkey);
    setObsEnabled(savedSettings.obsEnabled);
    setObsHost(savedSettings.obsHost);
    setObsPassword(savedSettings.obsPassword);
    setObsPort(savedSettings.obsPort);
    setObsFeedback(null);
    setFeedback(null);
  }

  async function handleTestObsConnection() {
    if (isTestingObs) {
      return;
    }

    const validation = validateObsSettings(true, obsHost, obsPort, obsPassword);

    if (!validation.isValid) {
      setObsFeedback({ message: validation.message, tone: "error" });
      return;
    }

    setIsTestingObs(true);
    setObsFeedback(null);

    try {
      await testObsConnection({
        host: validation.values.host,
        password: validation.values.password,
        port: validation.values.port,
      });
      setObsFeedback({ message: "OBS connected", tone: "success" });
    } catch (error) {
      setObsFeedback({
        message: isObsAuthenticationError(error)
          ? "Authentication failed"
          : "Could not connect to OBS",
        tone: "error",
      });
    } finally {
      setIsTestingObs(false);
    }
  }

  return (
    <section className="view" aria-labelledby="settings-title">
      <div className="view-header">
        <div className="view-title-row">
          <h2 id="settings-title">Settings</h2>
          <span className="status-badge">Local</span>
        </div>
        <p>Hotkeys</p>
      </div>
      {isLoading ? (
        <StatusPanel
          title="Loading settings"
          message="Reading your saved shortcuts."
          tone="loading"
        />
      ) : savedSettings === null ? (
        <StatusPanel
          title="Could not load settings"
          message="Your shortcuts were not changed."
          tone="error"
          actionLabel="Retry"
          onAction={() => setLoadAttempt((attempt) => attempt + 1)}
        />
      ) : (
        <form className="settings-form" onSubmit={handleSubmit}>
          <section className="settings-section" aria-labelledby="hotkeys-title">
            <div className="section-header">
              <h3 id="hotkeys-title">Hotkeys</h3>
            </div>
            <HotkeyInput
              id="start-stop-hotkey"
              label="Start or stop stream"
              value={startStopHotkey}
              disabled={isSaving}
              onCaptureChange={setHotkeysSuspended}
              onChange={setStartStopHotkey}
            />
            <HotkeyInput
              id="add-mark-hotkey"
              label="Add mark"
              value={addMarkHotkey}
              disabled={isSaving}
              onCaptureChange={setHotkeysSuspended}
              onChange={setAddMarkHotkey}
            />
          </section>
          <section className="settings-section" aria-labelledby="obs-title">
            <div className="section-header">
              <h3 id="obs-title">OBS integration</h3>
              {obsIntegration.enabled && obsIntegration.message !== null ? (
                <span>{obsIntegration.message}</span>
              ) : null}
            </div>
            <label className="toggle-field" htmlFor="obs-enabled">
              <input
                id="obs-enabled"
                type="checkbox"
                checked={obsEnabled}
                disabled={isSaving || isTestingObs}
                onChange={(event) => setObsEnabled(event.target.checked)}
              />
              <span>Enable OBS integration</span>
            </label>
            <div className="field">
              <label htmlFor="obs-host">Host</label>
              <input
                id="obs-host"
                value={obsHost}
                disabled={isSaving || isTestingObs || !obsEnabled}
                onChange={(event) => setObsHost(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="obs-port">Port</label>
              <input
                id="obs-port"
                type="number"
                min="1"
                max="65535"
                value={obsPort}
                disabled={isSaving || isTestingObs || !obsEnabled}
                onChange={(event) => setObsPort(event.target.valueAsNumber)}
              />
            </div>
            <div className="field">
              <label htmlFor="obs-password">Password</label>
              <input
                id="obs-password"
                type="password"
                autoComplete="off"
                value={obsPassword}
                disabled={isSaving || isTestingObs || !obsEnabled}
                onChange={(event) => setObsPassword(event.target.value)}
              />
            </div>
            <div className="toolbar">
              <Button
                type="button"
                disabled={isSaving || isTestingObs || !obsEnabled}
                onClick={handleTestObsConnection}
              >
                {isTestingObs ? "Testing..." : "Test connection"}
              </Button>
              {obsIntegration.enabled &&
              (obsIntegration.state === "disconnected" ||
                obsIntegration.state === "authentication-failed" ||
                obsIntegration.state === "error") ? (
                <Button type="button" onClick={obsIntegration.retry}>
                  Retry
                </Button>
              ) : null}
            </div>
            {obsFeedback === null ? null : (
              <p
                className={`form-feedback form-feedback-${obsFeedback.tone}`}
                role={obsFeedback.tone === "error" ? "alert" : "status"}
              >
                {obsFeedback.message}
              </p>
            )}
          </section>
          <div className="toolbar">
            <Button type="submit" variant="primary" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </Button>
            <Button type="button" disabled={isSaving} onClick={handleCancel}>
              Cancel
            </Button>
          </div>
          {feedback === null ? null : (
            <p
              className={`form-feedback form-feedback-${feedback.tone}`}
              role={feedback.tone === "error" ? "alert" : "status"}
            >
              {feedback.message}
            </p>
          )}
        </form>
      )}
    </section>
  );
}
