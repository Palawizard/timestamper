export type StreamSessionStatus = "active" | "completed";

export type StreamSession = {
  id: string;
  title: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMs: number | null;
  status: StreamSessionStatus;
  createdAt: string;
  updatedAt: string;
};
