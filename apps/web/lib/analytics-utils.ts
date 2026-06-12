/**
 * Formats a duration in milliseconds into a compact human-readable string.
 *
 * @param ms - Duration in milliseconds
 * @returns `{hours}h {minutes}m` when the duration is at least one hour, `{minutes}m` when the duration is at least one minute, or `"<1m"` when the duration is less than one minute
 */
export function formatDurationMs(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m`;
  return "<1m";
}
