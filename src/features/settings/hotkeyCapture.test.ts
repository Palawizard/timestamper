import { describe, expect, it } from "vitest";
import { captureHotkey, getModifierPreview } from "./hotkeyCapture";

function keyboardEvent(
  key: string,
  modifiers: Partial<{
    altKey: boolean;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
  }> = {},
) {
  return {
    altKey: false,
    ctrlKey: false,
    key,
    metaKey: false,
    shiftKey: false,
    ...modifiers,
  };
}

describe("hotkey capture", () => {
  it("captures a key without requiring a modifier", () => {
    expect(captureHotkey(keyboardEvent("F9"))).toBe("F9");
  });

  it("captures modifiers in a stable order", () => {
    expect(
      captureHotkey(
        keyboardEvent("k", { altKey: true, ctrlKey: true, shiftKey: true }),
      ),
    ).toBe("Ctrl+Alt+Shift+K");
  });

  it("maps browser key names to Tauri shortcut names", () => {
    expect(captureHotkey(keyboardEvent("ArrowUp"))).toBe("Up");
    expect(captureHotkey(keyboardEvent(" ", { ctrlKey: true }))).toBe(
      "Ctrl+Space",
    );
  });

  it("waits for a main key when only modifiers are pressed", () => {
    const event = keyboardEvent("Control", { ctrlKey: true });

    expect(captureHotkey(event)).toBeNull();
    expect(getModifierPreview(event)).toBe("Ctrl+...");
  });

  it("rejects unsupported keys", () => {
    expect(captureHotkey(keyboardEvent("CapsLock"))).toBeNull();
  });
});
