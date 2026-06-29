import { EmptyState } from "./EmptyState";

export function DesktopRequiredView() {
  return (
    <main className="app-shell desktop-required">
      <section className="view" aria-labelledby="desktop-required-title">
        <div className="view-header">
          <h2 id="desktop-required-title">Timestamper</h2>
          <p>Desktop app required</p>
        </div>
        <EmptyState title="Run pnpm tauri dev" />
      </section>
    </main>
  );
}
