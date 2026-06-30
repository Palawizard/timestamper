import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { HotkeyInput } from "../../components/HotkeyInput";
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

type Feedback = {
  message: string;
  tone: "error" | "success";
};

export function SettingsView() {
  const [addMarkHotkey, setAddMarkHotkey] = useState(DEFAULT_ADD_MARK_HOTKEY);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [savedSettings, setSavedSettings] = useState<Awaited<
    ReturnType<typeof getOrCreateAppSettings>
  > | null>(null);
  const [startStopHotkey, setStartStopHotkey] = useState(
    DEFAULT_START_STOP_HOTKEY,
  );
  const { setHotkeysSuspended } = useLiveSessionContext();

  useEffect(() => {
    return () => setHotkeysSuspended(false);
  }, [setHotkeysSuspended]);

  useEffect(() => {
    let isCurrent = true;

    async function loadSettings() {
      const settings = await getOrCreateAppSettings();

      if (isCurrent) {
        setSavedSettings(settings);
        setAddMarkHotkey(settings.addMarkHotkey);
        setStartStopHotkey(settings.startStopHotkey);
      }
    }

    void loadSettings();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    return subscribeToAppSettingsChanges((settings) => {
      setSavedSettings(settings);
      setAddMarkHotkey(settings.addMarkHotkey);
      setStartStopHotkey(settings.startStopHotkey);
    });
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateHotkeys(startStopHotkey, addMarkHotkey);

    if (!validation.isValid) {
      setFeedback({ message: validation.message, tone: "error" });
      return;
    }

    try {
      const now = new Date().toISOString();
      const nextSettings = {
        ...(savedSettings ?? (await getOrCreateAppSettings())),
        addMarkHotkey: validation.values.addMarkHotkey,
        startStopHotkey: validation.values.startStopHotkey,
        updatedAt: now,
      };

      await saveAppSettings(nextSettings);
      notifyAppSettingsChanged(nextSettings);
      setSavedSettings(nextSettings);
      setAddMarkHotkey(nextSettings.addMarkHotkey);
      setStartStopHotkey(nextSettings.startStopHotkey);
      setFeedback({ message: "Shortcut saved", tone: "success" });
    } catch (error) {
      console.error(error);
      setFeedback({ message: "Could not save settings", tone: "error" });
    }
  }

  function handleCancel() {
    if (savedSettings === null) {
      return;
    }

    setAddMarkHotkey(savedSettings.addMarkHotkey);
    setStartStopHotkey(savedSettings.startStopHotkey);
    setFeedback(null);
  }

  return (
    <section className="view" aria-labelledby="settings-title">
      <div className="view-header">
        <h2 id="settings-title">Settings</h2>
        <p>Hotkeys</p>
      </div>
      <form className="settings-form" onSubmit={handleSubmit}>
        <section className="settings-section" aria-labelledby="hotkeys-title">
          <div className="section-header">
            <h3 id="hotkeys-title">Hotkeys</h3>
          </div>
          <HotkeyInput
            id="start-stop-hotkey"
            label="Start or stop stream"
            value={startStopHotkey}
            onCaptureChange={setHotkeysSuspended}
            onChange={setStartStopHotkey}
          />
          <HotkeyInput
            id="add-mark-hotkey"
            label="Add mark"
            value={addMarkHotkey}
            onCaptureChange={setHotkeysSuspended}
            onChange={setAddMarkHotkey}
          />
        </section>
        <div className="toolbar">
          <Button type="submit" variant="primary">
            Save
          </Button>
          <Button type="button" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
        {feedback === null ? null : (
          <p className={`form-feedback form-feedback-${feedback.tone}`}>
            {feedback.message}
          </p>
        )}
      </form>
    </section>
  );
}
