import { useState } from "react";
import type { ReactNode } from "react";
import { AppLayout } from "../components/AppLayout";
import { HistoryView } from "../features/history/HistoryView";
import { LiveView } from "../features/live/LiveView";
import { SettingsView } from "../features/settings/SettingsView";
import { type AppRoute } from "./routes";

const views: Record<AppRoute, ReactNode> = {
  live: <LiveView />,
  history: <HistoryView />,
  settings: <SettingsView />,
};

export function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>("live");

  return (
    <AppLayout activeRoute={activeRoute} onRouteChange={setActiveRoute}>
      {views[activeRoute]}
    </AppLayout>
  );
}
