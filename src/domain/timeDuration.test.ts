import { describe, expect, it } from "vitest";
import { calculateDurationMs, calculateElapsedMs } from "./timeDuration";

describe("calculateElapsedMs", () => {
  it("calculates elapsed milliseconds from numeric timestamps", () => {
    expect(calculateElapsedMs(1_000, 6_500)).toBe(5_500);
  });

  it("does not return negative elapsed time", () => {
    expect(calculateElapsedMs(6_500, 1_000)).toBe(0);
  });

  it("handles non-finite numeric timestamps as zero", () => {
    expect(calculateElapsedMs(Number.NaN, 1_000)).toBe(0);
    expect(calculateElapsedMs(1_000, Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("calculateDurationMs", () => {
  it("calculates duration from ISO timestamps", () => {
    expect(
      calculateDurationMs(
        "2026-05-31T19:00:00.000Z",
        "2026-05-31T20:05:02.000Z",
      ),
    ).toBe(3_902_000);
  });

  it("does not return negative duration for reversed timestamps", () => {
    expect(
      calculateDurationMs(
        "2026-05-31T20:05:02.000Z",
        "2026-05-31T19:00:00.000Z",
      ),
    ).toBe(0);
  });

  it("handles invalid dates as zero", () => {
    expect(calculateDurationMs("invalid", "2026-05-31T20:05:02.000Z")).toBe(0);
    expect(calculateDurationMs("2026-05-31T19:00:00.000Z", "invalid")).toBe(0);
  });
});
