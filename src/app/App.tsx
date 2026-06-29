import { useState } from "react";
import type { ReactNode } from "react";
import { AppLayout } from "../components/AppLayout";
import { DesktopRequiredView } from "../components/DesktopRequiredView";
import { HistoryView } from "../features/history/HistoryView";
import { LiveView } from "../features/live/LiveView";
import { LiveSessionProvider } from "../features/live/LiveSessionProvider";
import { SettingsView } from "../features/settings/SettingsView";
import { isTauriRuntime } from "../services/runtime";
import { type AppRoute } from "./routes";

const views: Record<AppRoute, ReactNode> = {
  live: <LiveView />,
  history: <HistoryView />,
  settings: <SettingsView />,
};

export function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>("live");

  if (!isTauriRuntime()) {
    return <DesktopRequiredView />;
  }

  return (
    <LiveSessionProvider>
      <AppLayout activeRoute={activeRoute} onRouteChange={setActiveRoute}>
        {views[activeRoute]}
      </AppLayout>
    </LiveSessionProvider>
  );
}
