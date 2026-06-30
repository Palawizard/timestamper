import {
  createObsClient,
  isObsAuthenticationError,
  isObsSessionInvalidation,
  type ObsClient,
  type ObsClientFactory,
  type ObsConnectionSettings,
  type ObsStreamState,
  type ObsStreamStatus,
} from "./obsClient";

export type ObsConnectionState =
  | "disabled"
  | "connecting"
  | "connected"
  | "streaming"
  | "disconnected"
  | "authentication-failed"
  | "error";

type TimerId = ReturnType<typeof setTimeout>;

export type ObsConnectionControllerOptions = {
  createClient?: ObsClientFactory;
  onStateChange: (state: ObsConnectionState) => void;
  onStreamState: (state: ObsStreamState | ObsStreamStatus) => void;
  setTimer?: (callback: () => void, delayMs: number) => TimerId;
  clearTimer?: (timerId: TimerId) => void;
};

const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 15_000];

export class ObsConnectionController {
  private readonly createClient: ObsClientFactory;
  private readonly onStateChange: (state: ObsConnectionState) => void;
  private readonly onStreamState: (
    state: ObsStreamState | ObsStreamStatus,
  ) => void;
  private readonly setTimer: (callback: () => void, delayMs: number) => TimerId;
  private readonly clearTimer: (timerId: TimerId) => void;
  private client: ObsClient | null = null;
  private cleanups: Array<() => void> = [];
  private reconnectTimer: TimerId | null = null;
  private settings: ObsConnectionSettings | null = null;
  private generation = 0;
  private reconnectAttempt = 0;
  private stopped = true;

  constructor(options: ObsConnectionControllerOptions) {
    this.createClient = options.createClient ?? createObsClient;
    this.onStateChange = options.onStateChange;
    this.onStreamState = options.onStreamState;
    this.setTimer = options.setTimer ?? setTimeout;
    this.clearTimer = options.clearTimer ?? clearTimeout;
  }

  start(settings: ObsConnectionSettings): void {
    this.stop();
    this.settings = settings;
    this.stopped = false;
    this.reconnectAttempt = 0;
    void this.connect(this.generation);
  }

  retry(): void {
    if (this.settings === null) {
      return;
    }

    const settings = this.settings;
    this.stop();
    this.settings = settings;
    this.stopped = false;
    this.reconnectAttempt = 0;
    void this.connect(this.generation);
  }

  stop(): void {
    this.stopped = true;
    this.generation += 1;
    this.cancelReconnect();
    this.removeListeners();
    const client = this.client;
    this.client = null;
    this.settings = null;

    if (client !== null) {
      void client.disconnect().catch(() => undefined);
    }

    this.onStateChange("disabled");
  }

  private async connect(generation: number): Promise<void> {
    const settings = this.settings;

    if (this.stopped || settings === null || generation !== this.generation) {
      return;
    }

    this.onStateChange("connecting");
    const client = this.createClient();
    this.client = client;
    let didConnect = false;

    const removeClosedListener = client.onConnectionClosed((error) => {
      if (!didConnect || this.stopped || generation !== this.generation) {
        return;
      }

      this.removeListeners();
      this.client = null;
      this.handleFailure(error, generation);
    });
    const removeStreamListener = client.onStreamStateChanged((streamState) => {
      if (this.stopped || generation !== this.generation) {
        return;
      }

      this.onStateChange(streamState.outputActive ? "streaming" : "connected");
      this.onStreamState(streamState);
    });
    this.cleanups = [removeClosedListener, removeStreamListener];

    try {
      await client.connect(settings);
      didConnect = true;

      if (this.stopped || generation !== this.generation) {
        await client.disconnect().catch(() => undefined);
        return;
      }

      this.reconnectAttempt = 0;
      const streamStatus = await client.getStreamStatus();

      if (this.stopped || generation !== this.generation) {
        return;
      }

      this.onStateChange(streamStatus.outputActive ? "streaming" : "connected");
      this.onStreamState(streamStatus);
    } catch (error) {
      if (this.stopped || generation !== this.generation) {
        return;
      }

      this.removeListeners();
      this.client = null;
      await client.disconnect().catch(() => undefined);
      this.handleFailure(error, generation);
    }
  }

  private handleFailure(error: unknown, generation: number): void {
    if (isObsAuthenticationError(error)) {
      this.onStateChange("authentication-failed");
      return;
    }

    if (isObsSessionInvalidation(error)) {
      this.onStateChange("error");
      return;
    }

    this.onStateChange("disconnected");
    this.scheduleReconnect(generation);
  }

  private scheduleReconnect(generation: number): void {
    if (this.stopped || this.settings === null) {
      return;
    }

    const delayIndex = Math.min(
      this.reconnectAttempt,
      RECONNECT_DELAYS_MS.length - 1,
    );
    const delay = RECONNECT_DELAYS_MS[delayIndex];
    this.reconnectAttempt += 1;
    this.reconnectTimer = this.setTimer(() => {
      this.reconnectTimer = null;
      void this.connect(generation);
    }, delay);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer !== null) {
      this.clearTimer(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private removeListeners(): void {
    for (const cleanup of this.cleanups) {
      cleanup();
    }

    this.cleanups = [];
  }
}
