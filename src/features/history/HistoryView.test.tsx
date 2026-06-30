import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HistoryView } from "./HistoryView";

const { listCompletedStreamSessions } = vi.hoisted(() => ({
  listCompletedStreamSessions: vi.fn(),
}));

vi.mock("../../services/sessionsRepository", () => ({
  deleteStreamSession: vi.fn(),
  listCompletedStreamSessions,
}));

vi.mock("../../services/marksRepository", () => ({
  countTimestampMarksForSession: vi.fn(),
  listTimestampMarksForSession: vi.fn(),
}));

vi.mock("../../services/clipboard", () => ({
  copyTextToClipboard: vi.fn(),
}));

vi.mock("../../services/download", () => ({
  downloadTextFile: vi.fn(),
}));

describe("HistoryView", () => {
  beforeEach(() => {
    listCompletedStreamSessions.mockReset();
  });

  it("shows the empty state only after a successful load", async () => {
    listCompletedStreamSessions.mockResolvedValue([]);

    render(<HistoryView />);

    expect(await screen.findByText("No streams yet")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows a retryable error instead of a false empty state", async () => {
    listCompletedStreamSessions.mockRejectedValue(
      new Error("database unavailable"),
    );

    render(<HistoryView />);

    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Retry" })).toBeTruthy();
    expect(screen.queryByText("No streams yet")).toBeNull();
  });
});
