import { createContext, useContext } from "react";
import type { ObsConnectionState } from "../../services/obsConnection";

export type ObsIntegrationContextValue = {
  enabled: boolean;
  message: string | null;
  retry: () => void;
  state: ObsConnectionState;
};

export const ObsIntegrationContext =
  createContext<ObsIntegrationContextValue | null>(null);

export function useObsIntegrationContext(): ObsIntegrationContextValue {
  const context = useContext(ObsIntegrationContext);

  if (context === null) {
    throw new Error(
      "useObsIntegrationContext must be used within LiveSessionProvider",
    );
  }

  return context;
}
