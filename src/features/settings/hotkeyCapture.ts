type HotkeyKeyboardEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey" | "shiftKey"
>;

const KEY_ALIASES: Readonly<Record<string, string>> = {
  " ": "Space",
  ArrowDown: "Down",
  ArrowLeft: "Left",
  ArrowRight: "Right",
  ArrowUp: "Up",
  Backspace: "Backspace",
  Delete: "Delete",
  End: "End",
  Enter: "Enter",
  Home: "Home",
  Insert: "Insert",
  PageDown: "PageDown",
  PageUp: "PageUp",
  Tab: "Tab",
};

const MODIFIER_KEYS = new Set(["Alt", "AltGraph", "Control", "Meta", "Shift"]);

function normalizeMainKey(key: string): string | null {
  if (MODIFIER_KEYS.has(key)) {
    return null;
  }

  const alias = KEY_ALIASES[key];

  if (alias !== undefined) {
    return alias;
  }

  if (/^[a-z0-9]$/i.test(key)) {
    return key.toUpperCase();
  }

  if (/^F(?:[1-9]|1[0-9]|2[0-4])$/i.test(key)) {
    return key.toUpperCase();
  }

  return null;
}

export function getModifierPreview(event: HotkeyKeyboardEvent): string {
  const modifiers: string[] = [];

  if (event.ctrlKey) modifiers.push("Ctrl");
  if (event.altKey) modifiers.push("Alt");
  if (event.shiftKey) modifiers.push("Shift");
  if (event.metaKey) modifiers.push("Super");

  return modifiers.length === 0
    ? "Press keys..."
    : `${modifiers.join("+")}+...`;
}

export function captureHotkey(event: HotkeyKeyboardEvent): string | null {
  const mainKey = normalizeMainKey(event.key);

  if (mainKey === null) {
    return null;
  }

  const modifiers: string[] = [];

  if (event.ctrlKey) modifiers.push("Ctrl");
  if (event.altKey) modifiers.push("Alt");
  if (event.shiftKey) modifiers.push("Shift");
  if (event.metaKey) modifiers.push("Super");

  return [...modifiers, mainKey].join("+");
}
