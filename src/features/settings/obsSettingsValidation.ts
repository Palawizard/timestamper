export type ObsSettingsValues = {
  enabled: boolean;
  host: string;
  password: string;
  port: number;
};

export type ObsSettingsValidationResult =
  | { isValid: true; values: ObsSettingsValues }
  | { isValid: false; message: string };

export function validateObsSettings(
  enabled: boolean,
  host: string,
  port: number,
  password: string,
): ObsSettingsValidationResult {
  const normalizedHost = host.trim();

  if (normalizedHost.length === 0) {
    return { isValid: false, message: "Enter the OBS host" };
  }

  if (
    normalizedHost.includes("://") ||
    normalizedHost.includes("/") ||
    /\s/.test(normalizedHost)
  ) {
    return { isValid: false, message: "Enter a valid OBS host" };
  }

  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    return { isValid: false, message: "Enter a port between 1 and 65535" };
  }

  if (enabled && password.length === 0) {
    return { isValid: false, message: "Enter the OBS password" };
  }

  return {
    isValid: true,
    values: { enabled, host: normalizedHost, password, port },
  };
}
