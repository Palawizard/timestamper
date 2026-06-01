import type { AppSettings } from "../domain/settings";

export type AppSettingsListener = (settings: AppSettings) => void;

const SETTINGS_CHANGED_EVENT = "timestamper:settings-changed";

export function notifyAppSettingsChanged(settings: AppSettings): void {
  window.dispatchEvent(
    new CustomEvent<AppSettings>(SETTINGS_CHANGED_EVENT, {
      detail: settings,
    }),
  );
}

export function subscribeToAppSettingsChanges(
  listener: AppSettingsListener,
): () => void {
  const handleSettingsChanged = (event: Event) => {
    listener((event as CustomEvent<AppSettings>).detail);
  };

  window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);

  return () => {
    window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettingsChanged);
  };
}
