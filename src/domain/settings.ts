export type TimestampFormat = "hh:mm:ss" | "mm:ss";

export type AppSettings = {
  startStopHotkey: string;
  addMarkHotkey: string;
  timestampFormat: TimestampFormat;
  obsEnabled: boolean;
  obsHost: string;
  obsPort: number;
  obsPassword: string;
  createdAt: string;
  updatedAt: string;
};
