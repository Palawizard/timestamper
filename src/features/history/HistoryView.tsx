import { EmptyState } from "../../components/EmptyState";

export function HistoryView() {
  return (
    <section className="view" aria-labelledby="history-title">
      <div className="view-header">
        <h2 id="history-title">History</h2>
        <p>Streams</p>
      </div>
      <EmptyState title="No streams yet" />
    </section>
  );
}
