export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const dateFmt = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const dateFmtWithYear = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
const timeFmt = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });
const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  if (d.getFullYear() !== now.getFullYear()) return dateFmtWithYear.format(d);
  return dateFmt.format(d);
}

export function formatDateTime(iso: string) {
  return dateTimeFmt.format(new Date(iso));
}

export function formatTime(iso: string) {
  return timeFmt.format(new Date(iso));
}

export function formatRelative(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(iso);
}

export function toDatetimeLocalValue(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatPct(v: number) {
  return `${(v * 100).toFixed(1)}%`;
}

export function formatSigned(v: number) {
  return v > 0 ? `+${v}` : `${v}`;
}
