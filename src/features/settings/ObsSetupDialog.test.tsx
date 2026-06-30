import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ObsSetupDialog } from "./ObsSetupDialog";

HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute("open", "");
};

HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute("open");
};

describe("ObsSetupDialog", () => {
  it("shows the OBS setup steps and closes explicitly", () => {
    const onClose = vi.fn();

    render(<ObsSetupDialog onClose={onClose} open />);

    expect(screen.getByRole("dialog")).toHaveProperty("open", true);
    expect(screen.getByText("Connect Timestamper to OBS")).toBeTruthy();
    expect(screen.getByText("Open the OBS connection settings")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: "Close setup guide" }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
