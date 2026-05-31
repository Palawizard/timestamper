import type { ReactNode } from "react";
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
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}
