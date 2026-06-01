import type { StreamSession } from "../../domain/streamSession";

type StreamListProps = {
  selectedStreamId: string | null;
  streams: StreamSession[];
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
        <li key={stream.id}>
          <button
            className="stream-list-button"
            type="button"
            aria-current={selectedStreamId === stream.id ? "true" : undefined}
            onClick={() => onSelectStream(stream.id)}
          >
            <span>{stream.title ?? formatStreamDate(stream.startedAt)}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
