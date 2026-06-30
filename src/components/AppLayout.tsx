import type { ReactNode } from "react";
import { formatTimestamp } from "../domain/timeFormat";
import { useLiveSessionContext } from "../features/live/liveSessionContext";
import { Button } from "./Button";
import { type AppRoute, appRoutes } from "../app/routes";

type AppLayoutProps = {
  activeRoute: AppRoute;
  children: ReactNode;
  onRouteChange: (route: AppRoute) => void;
};

export function AppLayout({
  activeRoute,
  children,
  onRouteChange,
}: AppLayoutProps) {
  const { activeSession, elapsedMs, status } = useLiveSessionContext();
  const isRunning = activeSession !== null;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <p className="app-kicker">Stream tools</p>
          <h1>Timestamper</h1>
        </div>
        <nav className="nav-list" aria-label="Main navigation">
          {appRoutes.map((route) => (
            <Button
              key={route.id}
              className="nav-button"
              variant={activeRoute === route.id ? "primary" : "secondary"}
              aria-current={activeRoute === route.id ? "page" : undefined}
              onClick={() => onRouteChange(route.id)}
            >
              {route.label}
            </Button>
          ))}
        </nav>
        <div
          className={`sidebar-status${isRunning ? " sidebar-status-active" : ""}`}
          role="status"
        >
          <span className="status-dot" aria-hidden="true" />
          <div>
            <strong>
              {isRunning
                ? "Stream running"
                : status === "error"
                  ? "Needs attention"
                  : "Ready"}
            </strong>
            <span>{isRunning ? formatTimestamp(elapsedMs) : "Standby"}</span>
          </div>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
