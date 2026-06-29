import type { ReactNode } from "react";
import { LiveSessionContext } from "./liveSessionContext";
import { useLiveSession } from "./useLiveSession";

type LiveSessionProviderProps = {
  children: ReactNode;
};

export function LiveSessionProvider({ children }: LiveSessionProviderProps) {
  const value = useLiveSession();

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
}
