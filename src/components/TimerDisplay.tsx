import { formatTimestamp } from "../domain/timeFormat";

type TimerDisplayProps = {
  elapsedMs: number;
};

export function TimerDisplay({ elapsedMs }: TimerDisplayProps) {
  return <p className="timer-display">{formatTimestamp(elapsedMs)}</p>;
}
