import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { TimerDisplay } from "../../components/TimerDisplay";
import { formatTimestamp } from "../../domain/timeFormat";
import { useLiveSession } from "./useLiveSession";

export function LiveView() {
  const {
    addMark,
    activeSession,
    elapsedMs,
    errorMessage,
    marks,
    status,
    startSession,
    stopSession,
  } = useLiveSession();
  const isRunning = activeSession !== null;
  const markEmptyTitle = isRunning ? "No marks yet" : "Start a stream to add marks";

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
        <Button disabled={!isRunning} onClick={addMark}>
          Add mark
        </Button>
      </div>
      <TimerDisplay elapsedMs={elapsedMs} />
      <section className="marks-panel" aria-labelledby="current-marks-title">
        <div className="section-header">
          <h3 id="current-marks-title">Current marks</h3>
          <span>{marks.length}</span>
        </div>
        {marks.length === 0 ? (
          <EmptyState title={markEmptyTitle} />
        ) : (
          <ul className="mark-list" aria-label="Current marks">
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
