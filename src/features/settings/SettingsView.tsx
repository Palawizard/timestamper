import { Button } from "../../components/Button";

export function SettingsView() {
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
        </section>
        <div className="toolbar">
          <Button variant="primary">Save</Button>
          <Button>Cancel</Button>
        </div>
      </form>
    </section>
  );
}
