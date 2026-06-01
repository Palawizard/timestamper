import { Button } from "../../components/Button";
import { EmptyState } from "../../components/EmptyState";
import { TimerDisplay } from "../../components/TimerDisplay";
import { useLiveSession } from "./useLiveSession";

export function LiveView() {
  const { activeSession, elapsedMs, status, startSession, stopSession } =
    useLiveSession();
  const isRunning = activeSession !== null;

  return (
    <section className="view" aria-labelledby="live-title">
      <div className="view-header">
        <h2 id="live-title">Live</h2>
        <p>{status === "running" ? "Stream running" : "Ready"}</p>
      </div>
      <div className="toolbar">
        <Button
          variant="primary"
          onClick={isRunning ? stopSession : startSession}
        >
          {isRunning ? "Stop stream" : "Start stream"}
        </Button>
        <Button disabled={!isRunning}>Add mark</Button>
      </div>
      <TimerDisplay elapsedMs={elapsedMs} />
      <EmptyState title="No marks yet" />
    </section>
  );
}
