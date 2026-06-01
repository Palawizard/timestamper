import { Button } from "../../components/Button";
import type { TimestampMark } from "../../domain/timestampMark";
import { formatTimestamp } from "../../domain/timeFormat";
import type { StreamHistoryItem } from "./historyViewModel";

type StreamDetailsProps = {
  item: StreamHistoryItem;
  marks: TimestampMark[];
  onCopyAllMarks: () => void;
  onCopyTimestamp: (timestamp: string) => void;
  onExportCsv: () => void;
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function StreamDetails({
  item,
  marks,
  onCopyAllMarks,
  onCopyTimestamp,
  onExportCsv,
}: StreamDetailsProps) {
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
          <div className="section-actions">
            <span>{marks.length}</span>
            <Button disabled={marks.length === 0} onClick={onCopyAllMarks}>
              Copy all
            </Button>
            <Button disabled={marks.length === 0} onClick={onExportCsv}>
              Export CSV
            </Button>
          </div>
        </div>
        {marks.length === 0 ? (
          <p className="empty-state">No marks yet</p>
        ) : (
          <ul className="mark-list" aria-label="Marks">
            {marks.map((mark) => {
              const timestamp = formatTimestamp(mark.offsetMs);

              return (
                <li key={mark.id}>
                  <span>{timestamp}</span>
                  <Button onClick={() => onCopyTimestamp(timestamp)}>
                    Copy timestamp
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </section>
  );
}
