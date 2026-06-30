import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { TimerDisplay } from "../../components/TimerDisplay";
import { formatTimestamp } from "../../domain/timeFormat";
import { useLiveSessionContext } from "./liveSessionContext";

export function LiveView() {
  const {
    addMark,
    activeSession,
    elapsedMs,
    errorMessage,
    hotkeys,
    marks,
    noticeMessage,
    status,
    startSession,
    stopSession,
  } = useLiveSessionContext();
  const isRunning = activeSession !== null;
  const markEmptyTitle = isRunning
    ? "No marks yet"
    : "Start a stream to add marks";

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
                : (noticeMessage ?? "Ready")}
        </p>
      </div>
      <dl className="hotkey-list" aria-label="Current hotkeys">
        <div>
          <dt>Start or stop</dt>
          <dd>{hotkeys.startStopHotkey}</dd>
        </div>
        <div>
          <dt>Add mark</dt>
          <dd>{hotkeys.addMarkHotkey}</dd>
        </div>
      </dl>
      <div className="toolbar">
        <Button
          variant="primary"
          className={isRunning ? "button-danger" : ""}
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
