import type { StreamHistoryItem } from "./historyViewModel";

type StreamListProps = {
  selectedStreamId: string | null;
  streams: StreamHistoryItem[];
  onSelectStream: (streamId: string) => void;
};

function formatStreamDate(startedAt: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(startedAt));
}

export function StreamList({
  selectedStreamId,
  streams,
  onSelectStream,
}: StreamListProps) {
  return (
    <ul className="stream-list" aria-label="Streams">
      {streams.map((stream) => (
        <li key={stream.stream.id}>
          <button
            className="stream-list-button"
            type="button"
            aria-current={
              selectedStreamId === stream.stream.id ? "true" : undefined
            }
            onClick={() => onSelectStream(stream.stream.id)}
          >
            <span>
              {stream.stream.title ?? formatStreamDate(stream.stream.startedAt)}
            </span>
            <span>
              {stream.summary.duration} · {stream.summary.markCount} marks
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
