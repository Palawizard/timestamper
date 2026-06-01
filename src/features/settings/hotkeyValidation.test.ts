import { describe, expect, it } from "vitest";
import { validateHotkeys } from "./hotkeyValidation";

describe("hotkey validation", () => {
  it("accepts different hotkeys with modifiers and main keys", () => {
    expect(validateHotkeys(" Ctrl + Alt + F9 ", "Ctrl+Alt+F10")).toEqual({
      isValid: true,
      values: {
        addMarkHotkey: "Ctrl+Alt+F10",
        startStopHotkey: "Ctrl+Alt+F9",
      },
    });
  });

  it("rejects empty hotkeys", () => {
    expect(validateHotkeys("", "Ctrl+Alt+F10")).toEqual({
      isValid: false,
      message: "Shortcut required",
    });
  });

  it("rejects duplicate hotkeys", () => {
    expect(validateHotkeys("Ctrl+Alt+F9", "ctrl+alt+f9")).toEqual({
      isValid: false,
      message: "Shortcuts must be different",
    });
  });

  it("rejects hotkeys without modifiers", () => {
    expect(validateHotkeys("F9", "Ctrl+Alt+F10")).toEqual({
      isValid: false,
      message: "Shortcut needs a modifier",
    });
  });

  it("rejects hotkeys without a supported main key", () => {
    expect(validateHotkeys("Ctrl+Alt", "Ctrl+Alt+F10")).toEqual({
      isValid: false,
      message: "Shortcut unavailable",
    });
  });
});
