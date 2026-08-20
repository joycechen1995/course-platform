/**
 * Formats a Postgres TIMESTAMPTZ string (e.g. "2027-08-20 05:29:12.153363+00")
 * down to just the date portion (e.g. "2027-08-20") for display. Returns a
 * placeholder for null/undefined so callers can render it directly.
 */
export function formatDateOnly(value: string | null | undefined): string {
  if (!value) return "—";
  return value.slice(0, 10);
}

/** True if the given TIMESTAMPTZ string represents a moment in the past. */
export function isPast(value: string | null | undefined): boolean {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}
