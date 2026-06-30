import { useEffect, useState } from "react";
import { EmptyState } from "../../components/EmptyState";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { StatusPanel } from "../../components/StatusPanel";
import type { TimestampMark } from "../../domain/timestampMark";
import { downloadTextFile } from "../../services/download";
import {
  createExportFileName,
  formatMarksAsPlainText,
  formatStreamMarksAsCsv,
  formatStreamMarksAsJson,
} from "../export/exportFormatting";
import {
  countTimestampMarksForSession,
  listTimestampMarksForSession,
} from "../../services/marksRepository";
import { copyTextToClipboard } from "../../services/clipboard";
import {
  deleteStreamSession,
  listCompletedStreamSessions,
} from "../../services/sessionsRepository";
import {
  createStreamHistoryItem,
  type StreamHistoryItem,
} from "./historyViewModel";
import { StreamDetails } from "./StreamDetails";
import { StreamList } from "./StreamList";

export function HistoryView() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMarks, setIsLoadingMarks] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [marks, setMarks] = useState<TimestampMark[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null);
  const [streams, setStreams] = useState<StreamHistoryItem[]>([]);
  const [streamPendingDeletion, setStreamPendingDeletion] =
    useState<StreamHistoryItem | null>(null);
  const selectedStream =
    streams.find((item) => item.stream.id === selectedStreamId) ?? null;

  useEffect(() => {
    let isCurrent = true;

    async function loadStreams() {
      setIsLoading(true);

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
  }, [loadAttempt]);

  useEffect(() => {
    let isCurrent = true;

    async function loadMarks() {
      if (selectedStreamId === null) {
        setMarks([]);
        setIsLoadingMarks(false);
        return;
      }

      setMarks([]);
      setIsLoadingMarks(true);

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
      } finally {
        if (isCurrent) {
          setIsLoadingMarks(false);
        }
      }
    }

    void loadMarks();

    return () => {
      isCurrent = false;
    };
  }, [selectedStreamId]);

  async function handleCopyTimestamp(timestamp: string) {
    try {
      await copyTextToClipboard(timestamp);
      setStatusMessage("Timestamp copied");
    } catch (error) {
      console.error(error);
      setStatusMessage("Could not copy timestamp");
    }
  }

  async function handleCopyAllMarks() {
    try {
      await copyTextToClipboard(formatMarksAsPlainText(marks));
      setStatusMessage("Marks copied");
    } catch (error) {
      console.error(error);
      setStatusMessage("Could not copy marks");
    }
  }

  function handleExportCsv() {
    if (selectedStream === null) {
      return;
    }

    downloadTextFile(
      createExportFileName(selectedStream, "csv"),
      formatStreamMarksAsCsv(selectedStream, marks),
      "text/csv;charset=utf-8",
    );
    setStatusMessage("CSV exported");
  }

  function handleExportJson() {
    if (selectedStream === null) {
      return;
    }

    downloadTextFile(
      createExportFileName(selectedStream, "json"),
      formatStreamMarksAsJson(selectedStream, marks),
      "application/json;charset=utf-8",
    );
    setStatusMessage("JSON exported");
  }

  async function handleDeleteStream() {
    if (streamPendingDeletion === null) {
      return;
    }

    setIsDeleting(true);

    try {
      const deletedStreamId = streamPendingDeletion.stream.id;

      await deleteStreamSession(deletedStreamId);

      const remainingStreams = streams.filter(
        (item) => item.stream.id !== deletedStreamId,
      );

      setStreams(remainingStreams);
      setSelectedStreamId((currentId) =>
        currentId === deletedStreamId
          ? (remainingStreams[0]?.stream.id ?? null)
          : currentId,
      );
      setMarks([]);
      setStreamPendingDeletion(null);
      setErrorMessage(null);
      setStatusMessage("Stream deleted");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not delete stream");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="view" aria-labelledby="history-title">
      <div className="view-header">
        <div className="view-title-row">
          <h2 id="history-title">History</h2>
          {streams.length === 0 ? null : (
            <span className="status-badge">
              {streams.length} {streams.length === 1 ? "stream" : "streams"}
            </span>
          )}
        </div>
        <p>
          {errorMessage ?? statusMessage ?? (isLoading ? "Loading" : "Streams")}
        </p>
      </div>
      {errorMessage !== null && streams.length === 0 && !isLoading ? (
        <StatusPanel
          title="Could not load history"
          message="Your saved streams were not changed."
          tone="error"
          actionLabel="Retry"
          onAction={() => setLoadAttempt((attempt) => attempt + 1)}
        />
      ) : null}
      {streams.length === 0 && !isLoading && errorMessage === null ? (
        <section className="history-empty" aria-label="Streams">
          <EmptyState
            title="No streams yet"
            description="Completed streams with at least one mark will appear here."
          />
        </section>
      ) : null}
      {isLoading ? (
        <StatusPanel
          title="Loading history"
          message="Reading your saved streams and marks."
          tone="loading"
        />
      ) : null}
      {streams.length > 0 && !isLoading ? (
        <div className="history-layout">
          <StreamList
            selectedStreamId={selectedStreamId}
            streams={streams}
            onSelectStream={setSelectedStreamId}
          />
          {selectedStream === null ? null : (
            <StreamDetails
              isLoadingMarks={isLoadingMarks}
              item={selectedStream}
              marks={marks}
              onCopyAllMarks={handleCopyAllMarks}
              onCopyTimestamp={handleCopyTimestamp}
              onDelete={() => setStreamPendingDeletion(selectedStream)}
              onExportCsv={handleExportCsv}
              onExportJson={handleExportJson}
            />
          )}
        </div>
      ) : null}
      <ConfirmationDialog
        confirmLabel="Delete stream"
        isConfirming={isDeleting}
        message="This permanently deletes the stream and all of its marks."
        onCancel={() => setStreamPendingDeletion(null)}
        onConfirm={() => void handleDeleteStream()}
        open={streamPendingDeletion !== null}
        title="Delete this stream?"
      />
    </section>
  );
}
