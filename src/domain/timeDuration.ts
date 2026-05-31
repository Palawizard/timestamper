export function calculateElapsedMs(
  startedAtMs: number,
  currentMs: number,
): number {
  if (!Number.isFinite(startedAtMs) || !Number.isFinite(currentMs)) {
    return 0;
  }

  return Math.max(0, currentMs - startedAtMs);
}

export function calculateDurationMs(
  startedAt: string,
  endedAt: string,
): number {
  const startedAtMs = Date.parse(startedAt);
  const endedAtMs = Date.parse(endedAt);

  return calculateElapsedMs(startedAtMs, endedAtMs);
}
