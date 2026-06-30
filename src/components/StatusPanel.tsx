import { Button } from "./Button";

type StatusPanelProps = {
  actionLabel?: string;
  message?: string;
  onAction?: () => void;
  title: string;
  tone?: "error" | "info" | "loading";
};

export function StatusPanel({
  actionLabel,
  message,
  onAction,
  title,
  tone = "info",
}: StatusPanelProps) {
  return (
    <section
      className={`status-panel status-panel-${tone}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <div>
        <h3>{title}</h3>
        {message === undefined ? null : <p>{message}</p>}
      </div>
      {actionLabel === undefined || onAction === undefined ? null : (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </section>
  );
}
