export type StreamSessionStatus = "active" | "completed";
export type StreamSessionControlSource = "manual" | "obs";

export type StreamSession = {
  id: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  status: StreamSessionStatus;
  controlSource: StreamSessionControlSource;
  createdAt: string;
  updatedAt: string;
};
