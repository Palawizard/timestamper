import { useEffect, useState, type FormEvent } from "react";
import { Button } from "../../components/Button";
import { HotkeyInput } from "../../components/HotkeyInput";
import {
  DEFAULT_ADD_MARK_HOTKEY,
  DEFAULT_START_STOP_HOTKEY,
  getOrCreateAppSettings,
} from "../../services/settingsRepository";
import { validateHotkeys } from "./hotkeyValidation";

export function SettingsView() {
  const [addMarkHotkey, setAddMarkHotkey] = useState(DEFAULT_ADD_MARK_HOTKEY);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [startStopHotkey, setStartStopHotkey] = useState(
    DEFAULT_START_STOP_HOTKEY,
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadSettings() {
      const settings = await getOrCreateAppSettings();

      if (isCurrent) {
        setAddMarkHotkey(settings.addMarkHotkey);
        setStartStopHotkey(settings.startStopHotkey);
      }
    }

    void loadSettings();

    return () => {
      isCurrent = false;
    };
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateHotkeys(startStopHotkey, addMarkHotkey);

    if (!validation.isValid) {
      setFeedbackMessage(validation.message);
      return;
    }

    setFeedbackMessage(null);
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
            onChange={(event) => setStartStopHotkey(event.target.value)}
          />
          <HotkeyInput
            id="add-mark-hotkey"
            label="Add mark"
            value={addMarkHotkey}
            onChange={(event) => setAddMarkHotkey(event.target.value)}
          />
        </section>
        <div className="toolbar">
          <Button variant="primary">Save</Button>
          <Button>Cancel</Button>
        </div>
        {feedbackMessage === null ? null : (
          <p className="form-feedback">{feedbackMessage}</p>
        )}
      </form>
    </section>
  );
}
