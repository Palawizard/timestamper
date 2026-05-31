export type TimestampMark = {
  id: string;
  streamSessionId: string;
  offsetMs: number;
  note: string | null;
  createdAt: string;
};
