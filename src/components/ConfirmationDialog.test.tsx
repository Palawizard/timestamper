import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmationDialog } from "./ConfirmationDialog";

HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute("open", "");
};

HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute("open");
};

describe("ConfirmationDialog", () => {
  it("requires an explicit destructive confirmation", () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmationDialog
        confirmLabel="Delete stream"
        message="This also deletes its marks."
        onCancel={onCancel}
        onConfirm={onConfirm}
        open
        title="Delete this stream?"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete stream" }));

    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("allows deletion to be canceled", () => {
    const onCancel = vi.fn();

    render(
      <ConfirmationDialog
        confirmLabel="Delete stream"
        message="This also deletes its marks."
        onCancel={onCancel}
        onConfirm={() => undefined}
        open
        title="Delete this stream?"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledOnce();
  });
});
