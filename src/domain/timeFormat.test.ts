import { describe, expect, it } from "vitest";
import { formatTimestamp } from "./timeFormat";

describe("formatTimestamp", () => {
  it("formats zero milliseconds as a full timestamp", () => {
    expect(formatTimestamp(0)).toBe("00:00:00");
  });

  it("formats durations under one minute", () => {
    expect(formatTimestamp(9_000)).toBe("00:00:09");
  });

  it("formats durations over one hour", () => {
    expect(formatTimestamp(3_902_000)).toBe("01:05:02");
  });

  it("floors partial seconds", () => {
    expect(formatTimestamp(12_999)).toBe("00:00:12");
  });

  it("formats timestamps as total minutes and seconds", () => {
    expect(formatTimestamp(3_902_000, "mm:ss")).toBe("65:02");
  });

  it("handles negative and non-finite values as zero", () => {
    expect(formatTimestamp(-1)).toBe("00:00:00");
    expect(formatTimestamp(Number.NaN)).toBe("00:00:00");
    expect(formatTimestamp(Number.POSITIVE_INFINITY)).toBe("00:00:00");
  });
});
