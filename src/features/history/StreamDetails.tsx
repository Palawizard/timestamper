import type { StreamSession } from "../../domain/streamSession";

type StreamDetailsProps = {
  stream: StreamSession;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StreamDetails({ stream }: StreamDetailsProps) {
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
          <dd>{stream.endedAt === null ? "Unknown" : formatDateTime(stream.endedAt)}</dd>
        </div>
      </dl>
    </section>
  );
}
