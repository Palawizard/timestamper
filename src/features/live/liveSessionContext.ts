import { createContext, useContext } from "react";
import type { UseLiveSessionResult } from "./useLiveSession";

export const LiveSessionContext = createContext<UseLiveSessionResult | null>(
  null,
);

export function useLiveSessionContext(): UseLiveSessionResult {
  const context = useContext(LiveSessionContext);

  if (context === null) {
    throw new Error(
      "useLiveSessionContext must be used within LiveSessionProvider",
    );
  }

  return context;
}
