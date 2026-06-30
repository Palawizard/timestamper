export type HotkeyValues = {
  addMarkHotkey: string;
  startStopHotkey: string;
};

export type HotkeyValidationResult =
  | { isValid: true; values: HotkeyValues }
  | { isValid: false; message: string };

const MODIFIERS = new Set([
  "alt",
  "cmd",
  "command",
  "commandorcontrol",
  "control",
  "ctrl",
  "meta",
  "option",
  "shift",
  "super",
]);

const NAMED_KEYS = new Set([
  "backspace",
  "delete",
  "down",
  "end",
  "enter",
  "escape",
  "home",
  "insert",
  "left",
  "pagedown",
  "pageup",
  "right",
  "space",
  "tab",
  "up",
]);

function normalizeHotkey(value: string): string {
  return value
    .split("+")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("+");
}

function hasMainKey(value: string): boolean {
  const parts = value.split("+").map((part) => part.trim().toLowerCase());
  const mainKey = parts[parts.length - 1];

  if (mainKey === undefined || MODIFIERS.has(mainKey)) {
    return false;
  }

  return (
    /^[a-z0-9]$/.test(mainKey) ||
    /^f(?:[1-9]|1[0-9]|2[0-4])$/.test(mainKey) ||
    NAMED_KEYS.has(mainKey)
  );
}

export function validateHotkeys(
  startStopHotkey: string,
  addMarkHotkey: string,
): HotkeyValidationResult {
  const values = {
    addMarkHotkey: normalizeHotkey(addMarkHotkey),
    startStopHotkey: normalizeHotkey(startStopHotkey),
  };

  if (
    values.startStopHotkey.length === 0 ||
    values.addMarkHotkey.length === 0
  ) {
    return { isValid: false, message: "Shortcut required" };
  }

  if (
    values.startStopHotkey.toLowerCase() === values.addMarkHotkey.toLowerCase()
  ) {
    return { isValid: false, message: "Shortcuts must be different" };
  }

  if (
    !hasMainKey(values.startStopHotkey) ||
    !hasMainKey(values.addMarkHotkey)
  ) {
    return { isValid: false, message: "Shortcut unavailable" };
  }

  return { isValid: true, values };
}
