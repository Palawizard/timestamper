import { useEffect, useState } from "react";
import { Button } from "../../components/Button";
import { HotkeyInput } from "../../components/HotkeyInput";
import {
  DEFAULT_START_STOP_HOTKEY,
  getOrCreateAppSettings,
} from "../../services/settingsRepository";

export function SettingsView() {
  const [startStopHotkey, setStartStopHotkey] = useState(
    DEFAULT_START_STOP_HOTKEY,
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadSettings() {
      const settings = await getOrCreateAppSettings();

      if (isCurrent) {
        setStartStopHotkey(settings.startStopHotkey);
      }
    }

    void loadSettings();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="view" aria-labelledby="settings-title">
      <div className="view-header">
        <h2 id="settings-title">Settings</h2>
        <p>Hotkeys</p>
      </div>
      <form className="settings-form">
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
        </section>
        <div className="toolbar">
          <Button variant="primary">Save</Button>
          <Button>Cancel</Button>
        </div>
      </form>
    </section>
  );
}
