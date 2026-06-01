import type { TimestampMark } from "../../domain/timestampMark";
import { formatTimestamp } from "../../domain/timeFormat";
import type { StreamHistoryItem } from "./historyViewModel";

type StreamDetailsProps = {
  item: StreamHistoryItem;
  marks: TimestampMark[];
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StreamDetails({ item, marks }: StreamDetailsProps) {
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
            {stream.endedAt === null
              ? "Unknown"
              : formatDateTime(stream.endedAt)}
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
      <section className="marks-panel" aria-labelledby="history-marks-title">
        <div className="section-header">
          <h3 id="history-marks-title">Marks</h3>
          <span>{marks.length}</span>
        </div>
        {marks.length === 0 ? (
          <p className="empty-state">No marks yet</p>
        ) : (
          <ul className="mark-list" aria-label="Marks">
            {marks.map((mark) => (
              <li key={mark.id}>
                <span>{formatTimestamp(mark.offsetMs)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
