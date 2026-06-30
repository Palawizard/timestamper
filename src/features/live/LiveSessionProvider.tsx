import type { ReactNode } from "react";
import { LiveSessionContext } from "./liveSessionContext";
import { useLiveSession } from "./useLiveSession";
import { ObsIntegrationContext } from "../obs/obsIntegrationContext";
import { useObsIntegration } from "../obs/useObsIntegration";

type LiveSessionProviderProps = {
  children: ReactNode;
};

export function LiveSessionProvider({ children }: LiveSessionProviderProps) {
  const value = useLiveSession();
  const obsValue = useObsIntegration(value);

  return (
    <LiveSessionContext.Provider value={value}>
      <ObsIntegrationContext.Provider value={obsValue}>
        {children}
      </ObsIntegrationContext.Provider>
    </LiveSessionContext.Provider>
  );
}
