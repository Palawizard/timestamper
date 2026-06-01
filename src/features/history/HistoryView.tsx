import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import type { StreamSession } from "../../domain/streamSession";
import { listCompletedStreamSessions } from "../../services/sessionsRepository";
import { StreamList } from "./StreamList";

export function HistoryView() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [streams, setStreams] = useState<StreamSession[]>([]);

  useEffect(() => {
    let isCurrent = true;

    async function loadStreams() {
      try {
        const completedStreams = await listCompletedStreamSessions();

        if (!isCurrent) {
          return;
        }

        setStreams(completedStreams);
        setSelectedStreamId(completedStreams[0]?.id ?? null);
        setErrorMessage(null);
      } catch (error) {
        console.error(error);

        if (isCurrent) {
          setErrorMessage("Could not load history");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    void loadStreams();

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <section className="view" aria-labelledby="history-title">
      <div className="view-header">
        <h2 id="history-title">History</h2>
        <p>{errorMessage ?? (isLoading ? "Loading" : "Streams")}</p>
      </div>
      {streams.length === 0 ? (
        <EmptyState title={isLoading ? "Loading" : "No streams yet"} />
      ) : (
        <StreamList
          selectedStreamId={selectedStreamId}
          streams={streams}
          onSelectStream={setSelectedStreamId}
        />
      )}
    </section>
  );
}
