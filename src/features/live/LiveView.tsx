import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";

export function LiveView() {
  return (
    <section className="view" aria-labelledby="live-title">
      <div className="view-header">
        <h2 id="live-title">Live</h2>
        <p>Ready</p>
      </div>
      <div className="toolbar">
        <Button variant="primary">Start stream</Button>
        <Button>Add mark</Button>
      </div>
      <EmptyState title="No marks yet" />
    </section>
  );
}
