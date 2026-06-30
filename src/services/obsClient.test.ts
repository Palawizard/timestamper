import { describe, expect, it, vi } from "vitest";
import {
  getObsErrorCode,
  isObsAuthenticationError,
  isObsSessionInvalidation,
  testObsConnection,
  type ObsClient,
} from "./obsClient";

describe("OBS client helpers", () => {
  it("classifies authentication and session errors", () => {
    expect(getObsErrorCode({ code: 4009 })).toBe(4009);
    expect(isObsAuthenticationError({ code: 4009 })).toBe(true);
    expect(isObsSessionInvalidation({ code: 4011 })).toBe(true);
    expect(isObsAuthenticationError(new Error("private details"))).toBe(false);
  });

  it("disconnects after a connection test", async () => {
    const disconnect = vi.fn().mockResolvedValue(undefined);
    const client: ObsClient = {
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect,
      getStreamStatus: vi.fn().mockResolvedValue({
        outputActive: false,
        outputDuration: 0,
        outputReconnecting: false,
        outputState: "OBS_WEBSOCKET_OUTPUT_STOPPED",
      }),
      onConnectionClosed: vi.fn(() => () => undefined),
      onStreamStateChanged: vi.fn(() => () => undefined),
    };

    await testObsConnection(
      { host: "127.0.0.1", port: 4455, password: "secret" },
      () => client,
    );

    expect(disconnect).toHaveBeenCalledOnce();
  });
});
