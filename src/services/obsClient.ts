import OBSWebSocket, {
  EventSubscription,
  OBSWebSocketError,
} from "obs-websocket-js";

export type ObsConnectionSettings = {
  host: string;
  port: number;
  password: string;
};

export type ObsStreamState = {
  outputActive: boolean;
  outputState: string;
};

export type ObsStreamStatus = ObsStreamState & {
  outputDuration: number;
  outputReconnecting: boolean;
};

export type ObsClient = {
  connect: (settings: ObsConnectionSettings) => Promise<void>;
  disconnect: () => Promise<void>;
  getStreamStatus: () => Promise<ObsStreamStatus>;
  onConnectionClosed: (listener: (error: unknown) => void) => () => void;
  onStreamStateChanged: (
    listener: (state: ObsStreamState) => void,
  ) => () => void;
};

export type ObsClientFactory = () => ObsClient;

export const OBS_AUTHENTICATION_FAILED_CODE = 4009;
export const OBS_SESSION_INVALIDATED_CODE = 4011;

function buildObsUrl({ host, port }: ObsConnectionSettings): string {
  return `ws://${host}:${port}`;
}

export function getObsErrorCode(error: unknown): number | null {
  if (error instanceof OBSWebSocketError) {
    return error.code;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "number"
  ) {
    return error.code;
  }

  return null;
}

export function isObsAuthenticationError(error: unknown): boolean {
  return getObsErrorCode(error) === OBS_AUTHENTICATION_FAILED_CODE;
}

export function isObsSessionInvalidation(error: unknown): boolean {
  return getObsErrorCode(error) === OBS_SESSION_INVALIDATED_CODE;
}

export class ObsWebSocketClient implements ObsClient {
  private readonly socket = new OBSWebSocket();

  async connect(settings: ObsConnectionSettings): Promise<void> {
    await this.socket.connect(
      buildObsUrl(settings),
      settings.password || undefined,
      {
        eventSubscriptions: EventSubscription.Outputs,
        rpcVersion: 1,
      },
    );
  }

  async disconnect(): Promise<void> {
    await this.socket.disconnect();
  }

  async getStreamStatus(): Promise<ObsStreamStatus> {
    const status = await this.socket.call("GetStreamStatus");

    return {
      outputActive: status.outputActive,
      outputDuration: status.outputDuration,
      outputReconnecting: status.outputReconnecting,
      outputState: status.outputReconnecting
        ? "OBS_WEBSOCKET_OUTPUT_RECONNECTING"
        : status.outputActive
          ? "OBS_WEBSOCKET_OUTPUT_STARTED"
          : "OBS_WEBSOCKET_OUTPUT_STOPPED",
    };
  }

  onConnectionClosed(listener: (error: unknown) => void): () => void {
    this.socket.on("ConnectionClosed", listener);
    return () => this.socket.off("ConnectionClosed", listener);
  }

  onStreamStateChanged(listener: (state: ObsStreamState) => void): () => void {
    this.socket.on("StreamStateChanged", listener);
    return () => this.socket.off("StreamStateChanged", listener);
  }
}

export function createObsClient(): ObsClient {
  return new ObsWebSocketClient();
}

export async function testObsConnection(
  settings: ObsConnectionSettings,
  createClient: ObsClientFactory = createObsClient,
): Promise<ObsStreamStatus> {
  const client = createClient();

  try {
    await client.connect(settings);
    return await client.getStreamStatus();
  } finally {
    await client.disconnect().catch(() => undefined);
  }
}
