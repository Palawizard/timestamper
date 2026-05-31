import { Button } from "../../components/Button";

export function SettingsView() {
  return (
    <section className="view" aria-labelledby="settings-title">
      <div className="view-header">
        <h2 id="settings-title">Settings</h2>
        <p>Hotkeys</p>
      </div>
      <div className="toolbar">
        <Button variant="primary">Save</Button>
        <Button>Cancel</Button>
      </div>
    </section>
  );
}
