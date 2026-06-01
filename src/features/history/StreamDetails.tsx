import type { StreamHistoryItem } from "./historyViewModel";

type StreamDetailsProps = {
  item: StreamHistoryItem;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StreamDetails({ item }: StreamDetailsProps) {
  const { stream, summary } = item;

  return (
    <section className="stream-details" aria-labelledby="stream-details-title">
      <div className="section-header">
        <h3 id="stream-details-title">{stream.title ?? "Stream details"}</h3>
      </div>
      <dl className="summary-list">
        <div>
          <dt>Started</dt>
          <dd>{formatDateTime(stream.startedAt)}</dd>
        </div>
        <div>
          <dt>Ended</dt>
          <dd>
            {stream.endedAt === null ? "Unknown" : formatDateTime(stream.endedAt)}
          </dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{summary.duration}</dd>
        </div>
        <div>
          <dt>Marks</dt>
          <dd>{summary.markCount}</dd>
        </div>
      </dl>
    </section>
  );
}
