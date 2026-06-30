import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { HotkeyInput } from "./HotkeyInput";

describe("HotkeyInput", () => {
  it("captures a shortcut from the keyboard", () => {
    const onChange = vi.fn();

    render(
      <HotkeyInput
        id="shortcut"
        label="Shortcut"
        value="Ctrl+Alt+F9"
        onChange={onChange}
      />,
    );

    const input = screen.getByLabelText("Shortcut") as HTMLInputElement;

    fireEvent.focus(input);
    expect(input.value).toBe("Press keys...");

    fireEvent.keyDown(input, { key: "F9" });

    expect(onChange).toHaveBeenCalledWith("F9");
  });

  it("previews modifiers until a main key is pressed", () => {
    render(
      <HotkeyInput
        id="shortcut"
        label="Shortcut"
        value="F9"
        onChange={() => undefined}
      />,
    );

    const input = screen.getByLabelText("Shortcut") as HTMLInputElement;

    fireEvent.focus(input);
    fireEvent.keyDown(input, { ctrlKey: true, key: "Control" });

    expect(input.value).toBe("Ctrl+...");
  });

  it("reports when shortcut capture starts and stops", () => {
    const onCaptureChange = vi.fn();

    render(
      <HotkeyInput
        id="shortcut"
        label="Shortcut"
        value="F9"
        onCaptureChange={onCaptureChange}
        onChange={() => undefined}
      />,
    );

    const input = screen.getByLabelText("Shortcut");

    fireEvent.focus(input);
    fireEvent.blur(input);

    expect(onCaptureChange).toHaveBeenNthCalledWith(1, true);
    expect(onCaptureChange).toHaveBeenNthCalledWith(2, false);
  });
});
