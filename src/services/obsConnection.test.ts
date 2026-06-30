import { describe, expect, it, vi } from "vitest";
import type { ObsClient, ObsStreamState, ObsStreamStatus } from "./obsClient";
import { ObsConnectionController } from "./obsConnection";

type FakeClientOptions = {
  connectError?: unknown;
  status?: ObsStreamStatus;
};

function createFakeClient(options: FakeClientOptions = {}) {
  let closeListener: ((error: unknown) => void) | null = null;
  let streamListener: ((state: ObsStreamState) => void) | null = null;
  const disconnect = vi.fn().mockResolvedValue(undefined);
  const removeClose = vi.fn();
  const removeStream = vi.fn();
  const client: ObsClient = {
    connect: vi.fn().mockImplementation(async () => {
      if (options.connectError !== undefined) {
        throw options.connectError;
      }
    }),
    disconnect,
    getStreamStatus: vi.fn().mockResolvedValue(
      options.status ?? {
        outputActive: false,
        outputDuration: 0,
        outputReconnecting: false,
        outputState: "OBS_WEBSOCKET_OUTPUT_STOPPED",
      },
    ),
    onConnectionClosed: (listener) => {
      closeListener = listener;
      return removeClose;
    },
    onStreamStateChanged: (listener) => {
      streamListener = listener;
      return removeStream;
    },
  };

  return {
    client,
    disconnect,
    emitClose: (error: unknown) => closeListener?.(error),
    emitStream: (state: ObsStreamState) => streamListener?.(state),
    removeClose,
    removeStream,
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

describe("ObsConnectionController", () => {
  it("connects, reconciles status, and forwards stream events", async () => {
    const fake = createFakeClient({
      status: {
        outputActive: true,
        outputDuration: 12_000,
        outputReconnecting: false,
        outputState: "OBS_WEBSOCKET_OUTPUT_STARTED",
      },
    });
    const states: string[] = [];
    const streamStates: Array<ObsStreamState | ObsStreamStatus> = [];
    const controller = new ObsConnectionController({
      createClient: () => fake.client,
      onStateChange: (state) => states.push(state),
      onStreamState: (state) => streamStates.push(state),
    });

    controller.start({ host: "127.0.0.1", port: 4455, password: "secret" });
    await flushPromises();

    expect(states).toContain("streaming");
    expect(streamStates[0]).toMatchObject({ outputDuration: 12_000 });

    fake.emitStream({
      outputActive: false,
      outputState: "OBS_WEBSOCKET_OUTPUT_STOPPED",
    });
    expect(states[states.length - 1]).toBe("connected");
  });

  it("retries disconnects with capped delays", async () => {
    const clients = Array.from({ length: 6 }, () =>
      createFakeClient({ connectError: { code: 1006 } }),
    );
    let clientIndex = 0;
    const scheduled: Array<{ callback: () => void; delay: number }> = [];
    const controller = new ObsConnectionController({
      createClient: () => clients[clientIndex++].client,
      onStateChange: vi.fn(),
      onStreamState: vi.fn(),
      setTimer: (callback, delay) => {
        scheduled.push({ callback, delay });
        return scheduled.length as ReturnType<typeof setTimeout>;
      },
      clearTimer: vi.fn(),
    });

    controller.start({ host: "127.0.0.1", port: 4455, password: "" });
    await flushPromises();

    const expectedDelays = [1_000, 2_000, 5_000, 10_000, 15_000];
    for (let index = 0; index < expectedDelays.length; index += 1) {
      expect(scheduled[index].delay).toBe(expectedDelays[index]);
      scheduled[index].callback();
      await flushPromises();
    }
  });

  it("does not retry authentication failures", async () => {
    const fake = createFakeClient({ connectError: { code: 4009 } });
    const setTimer = vi.fn();
    const onStateChange = vi.fn();
    const controller = new ObsConnectionController({
      createClient: () => fake.client,
      onStateChange,
      onStreamState: vi.fn(),
      setTimer,
    });

    controller.start({ host: "127.0.0.1", port: 4455, password: "wrong" });
    await flushPromises();

    expect(onStateChange).toHaveBeenLastCalledWith("authentication-failed");
    expect(setTimer).not.toHaveBeenCalled();
  });

  it("removes listeners and cancels pending retries when stopped", async () => {
    const fake = createFakeClient();
    const clearTimer = vi.fn();
    const controller = new ObsConnectionController({
      createClient: () => fake.client,
      onStateChange: vi.fn(),
      onStreamState: vi.fn(),
      setTimer: () => 7 as unknown as ReturnType<typeof setTimeout>,
      clearTimer,
    });

    controller.start({ host: "127.0.0.1", port: 4455, password: "" });
    await flushPromises();
    fake.emitClose({ code: 1006 });
    controller.stop();

    expect(fake.removeClose).toHaveBeenCalled();
    expect(fake.removeStream).toHaveBeenCalled();
    expect(clearTimer).toHaveBeenCalled();
  });
});
