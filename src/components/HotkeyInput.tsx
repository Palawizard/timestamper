import { useState, type KeyboardEvent } from "react";
import {
  captureHotkey,
  getModifierPreview,
} from "../features/settings/hotkeyCapture";

type HotkeyInputProps = {
  id: string;
  label: string;
  onCaptureChange?: (isCapturing: boolean) => void;
  onChange: (value: string) => void;
  value: string;
};

export function HotkeyInput({
  id,
  label,
  onCaptureChange,
  onChange,
  value,
}: HotkeyInputProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [preview, setPreview] = useState("Press keys...");

  function stopCapturing() {
    setIsCapturing(false);
    setPreview("Press keys...");
    onCaptureChange?.(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    event.preventDefault();
    event.stopPropagation();

    if (event.key === "Escape") {
      stopCapturing();
      event.currentTarget.blur();
      return;
    }

    const hotkey = captureHotkey(event.nativeEvent);

    if (hotkey === null) {
      setPreview(getModifierPreview(event.nativeEvent));
      return;
    }

    onChange(hotkey);
    stopCapturing();
    event.currentTarget.blur();
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`hotkey-input${isCapturing ? " hotkey-input-capturing" : ""}`}
        type="text"
        value={isCapturing ? preview : value}
        readOnly
        onBlur={stopCapturing}
        onFocus={() => {
          setIsCapturing(true);
          onCaptureChange?.(true);
        }}
        onKeyDown={handleKeyDown}
        aria-describedby={`${id}-hint`}
      />
      <small id={`${id}-hint`} className="field-hint">
        Click, then press a shortcut. Escape cancels.
      </small>
    </div>
  );
}
