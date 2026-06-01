import {
  register,
  unregister,
  type ShortcutEvent,
} from "@tauri-apps/plugin-global-shortcut";

export type HotkeyHandler = () => void;
export type HotkeyCleanup = () => Promise<void>;

function isPressed(event: ShortcutEvent): boolean {
  return event.state === "Pressed";
}

async function registerHotkey(
  shortcut: string,
  handler: HotkeyHandler,
): Promise<HotkeyCleanup> {
  await register(shortcut, (event) => {
    if (isPressed(event)) {
      handler();
    }
  });

  return () => unregister(shortcut);
}

export function registerStartStopHotkey(
  shortcut: string,
  handler: HotkeyHandler,
): Promise<HotkeyCleanup> {
  return registerHotkey(shortcut, handler);
}
