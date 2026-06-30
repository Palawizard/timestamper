import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { StatusPanel } from "./StatusPanel";

describe("StatusPanel", () => {
  it("announces errors and exposes a retry action", () => {
    const onRetry = vi.fn();

    render(
      <StatusPanel
        title="Could not load history"
        message="Your saved streams were not changed."
        tone="error"
        actionLabel="Retry"
        onAction={onRetry}
      />,
    );

    expect(screen.getByRole("alert")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
