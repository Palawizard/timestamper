import { describe, expect, it } from "vitest";
import { validateObsSettings } from "./obsSettingsValidation";

describe("OBS settings validation", () => {
  it("normalizes valid connection settings", () => {
    expect(validateObsSettings(true, " 127.0.0.1 ", 4455, "secret")).toEqual({
      isValid: true,
      values: {
        enabled: true,
        host: "127.0.0.1",
        password: "secret",
        port: 4455,
      },
    });
  });

  it("rejects URLs and invalid ports", () => {
    expect(
      validateObsSettings(false, "ws://127.0.0.1", 4455, ""),
    ).toMatchObject({ isValid: false, message: "Enter a valid OBS host" });
    expect(validateObsSettings(false, "localhost", 70_000, "")).toMatchObject({
      isValid: false,
      message: "Enter a port between 1 and 65535",
    });
  });

  it("requires a password when integration is enabled", () => {
    expect(validateObsSettings(true, "localhost", 4455, "")).toMatchObject({
      isValid: false,
      message: "Enter the OBS password",
    });
  });
});
