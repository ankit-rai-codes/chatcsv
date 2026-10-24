const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 });

export function formatNumber(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? number.format(value) : String(value ?? "—");
}

export function formatCompact(value: unknown): string {
  return typeof value === "number" && Number.isFinite(value) ? compact.format(value) : String(value ?? "");
}

export function formatCell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return formatNumber(value);
  return String(value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[i]}`;
}

export function formatDuration(ms: number): string {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`;
}

/** Axis tick: ISO dates become "Mar 24" (month starts) or "Mar 5"; other values are truncated. */
export function formatXTick(value: string | number, isTime: boolean): string {
  const text = String(value);
  if (isTime) {
    const date = new Date(text.length === 7 ? `${text}-01` : text);
    if (!Number.isNaN(date.getTime())) {
      const monthStart = date.getUTCDate() === 1;
      return date.toLocaleDateString("en-US", {
        month: "short",
        ...(monthStart ? { year: "2-digit" } : { day: "numeric" }),
        timeZone: "UTC",
      });
    }
  }
  return text.length > 16 ? `${text.slice(0, 15)}…` : text;
}

export function plural(count: number, word: string): string {
  return `${formatNumber(count)} ${word}${count === 1 ? "" : "s"}`;
}
