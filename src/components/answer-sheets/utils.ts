export function formatTimestamp(seconds?: number | null): string | null {
  if (seconds === null || seconds === undefined) {
    return null;
  }

  if (Number.isNaN(seconds) || seconds < 0) {
    return null;
  }

  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);

  return `${minutes.toString().padStart(2, "0")}:${remaining.toString().padStart(2, "0")}`;
}
