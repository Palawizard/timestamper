import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { TimerDisplay } from "../../components/TimerDisplay";
import { formatTimestamp } from "../../domain/timeFormat";
import { useLiveSession } from "./useLiveSession";

export function LiveView() {
  const {
    activeSession,
    elapsedMs,
    errorMessage,
    marks,
    status,
    startSession,
    stopSession,
  } = useLiveSession();
  const isRunning = activeSession !== null;

  return (
    <section className="view" aria-labelledby="live-title">
      <div className="view-header">
        <h2 id="live-title">Live</h2>
        <p>
          {status === "error"
            ? errorMessage
            : status === "loading"
              ? "Loading"
              : status === "running"
                ? "Stream running"
                : "Ready"}
        </p>
      </div>
      <div className="toolbar">
        <Button
          variant="primary"
          disabled={status === "loading"}
          onClick={isRunning ? stopSession : startSession}
        >
          {isRunning ? "Stop stream" : "Start stream"}
        </Button>
        <Button disabled={!isRunning}>Add mark</Button>
      </div>
      <TimerDisplay elapsedMs={elapsedMs} />
      {marks.length === 0 ? (
        <EmptyState title="No marks yet" />
      ) : (
        <ul className="mark-list" aria-label="Current marks">
          {marks.map((mark) => (
            <li key={mark.id}>{formatTimestamp(mark.offsetMs)}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
