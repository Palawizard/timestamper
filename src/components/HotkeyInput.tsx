import type { InputHTMLAttributes } from "react";

type HotkeyInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function HotkeyInput({ id, label, ...props }: HotkeyInputProps) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} className="hotkey-input" type="text" {...props} />
    </label>
  );
}
