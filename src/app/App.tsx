import { useState } from "react";
import type { ReactNode } from "react";
import { HistoryView } from "../features/history/HistoryView";
import { LiveView } from "../features/live/LiveView";
import { SettingsView } from "../features/settings/SettingsView";
import { type AppRoute, appRoutes } from "./routes";

const views: Record<AppRoute, ReactNode> = {
  live: <LiveView />,
  history: <HistoryView />,
  settings: <SettingsView />,
};

export function App() {
  const [activeRoute, setActiveRoute] = useState<AppRoute>("live");

  return (
    <div>
      <header>
        <h1>Timestamper</h1>
        <nav aria-label="Main navigation">
          {appRoutes.map((route) => (
            <button
              key={route.id}
              type="button"
              aria-current={activeRoute === route.id ? "page" : undefined}
              onClick={() => setActiveRoute(route.id)}
            >
              {route.label}
            </button>
          ))}
        </nav>
      </header>
      <main>{views[activeRoute]}</main>
    </div>
  );
}
