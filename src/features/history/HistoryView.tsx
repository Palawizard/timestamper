import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import type { TimestampMark } from "../../domain/timestampMark";
import {
  countTimestampMarksForSession,
  listTimestampMarksForSession,
} from "../../services/marksRepository";
import { listCompletedStreamSessions } from "../../services/sessionsRepository";
import {
  createStreamHistoryItem,
  type StreamHistoryItem,
} from "./historyViewModel";
import { StreamDetails } from "./StreamDetails";
import { StreamList } from "./StreamList";

export function HistoryView() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [marks, setMarks] = useState<TimestampMark[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [streams, setStreams] = useState<StreamHistoryItem[]>([]);
  const selectedStream =
    streams.find((item) => item.stream.id === selectedStreamId) ?? null;

  useEffect(() => {
    let isCurrent = true;

    async function loadStreams() {
      try {
        const completedStreams = await listCompletedStreamSessions();
        const historyItems = await Promise.all(
          completedStreams.map(async (stream) =>
            createStreamHistoryItem(
              stream,
              await countTimestampMarksForSession(stream.id),
            ),
          ),
        );

        if (!isCurrent) {
          return;
        }

        setStreams(historyItems);
        setSelectedStreamId(historyItems[0]?.stream.id ?? null);
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

  useEffect(() => {
    let isCurrent = true;

    async function loadMarks() {
      if (selectedStreamId === null) {
        setMarks([]);
        return;
      }

      try {
        const selectedMarks =
          await listTimestampMarksForSession(selectedStreamId);

        if (isCurrent) {
          setMarks(selectedMarks);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error(error);

        if (isCurrent) {
          setErrorMessage("Could not load marks");
        }
      }
    }

    void loadMarks();

    return () => {
      isCurrent = false;
    };
  }, [selectedStreamId]);

  return (
    <section className="view" aria-labelledby="history-title">
      <div className="view-header">
        <h2 id="history-title">History</h2>
        <p>{errorMessage ?? (isLoading ? "Loading" : "Streams")}</p>
      </div>
      {streams.length === 0 && !isLoading ? (
        <section className="history-empty" aria-label="Streams">
          <EmptyState title="No streams yet" />
        </section>
      ) : null}
      {streams.length === 0 && isLoading ? (
        <EmptyState title="Loading" />
      ) : null}
      {streams.length > 0 ? (
        <div className="history-layout">
          <StreamList
            selectedStreamId={selectedStreamId}
            streams={streams}
            onSelectStream={setSelectedStreamId}
          />
          {selectedStream === null ? null : (
            <StreamDetails item={selectedStream} marks={marks} />
          )}
        </div>
      ) : null}
    </section>
  );
}
