export type AppRoute = "live" | "history" | "settings";

export const appRoutes: Array<{ id: AppRoute; label: string }> = [
  { id: "live", label: "Live" },
  { id: "history", label: "History" },
  { id: "settings", label: "Settings" },
];
