import { cn } from "../lib/format";

export function FormDots({ form, size = "sm" }: { form: ("W" | "L")[]; size?: "xs" | "sm" | "md" }) {
  const dims = { xs: "h-1.5 w-1.5", sm: "h-2 w-2", md: "h-2.5 w-2.5" }[size];
  if (!form.length) {
    return <span className="text-xs text-slate-400 dark:text-slate-600">No matches yet</span>;
  }
  return (
    <div className="flex items-center gap-1">
      {form.map((r, i) => (
        <span
          key={i}
          title={r === "W" ? "Win" : "Loss"}
          className={cn(
            dims,
            "rounded-full",
            r === "W" ? "bg-emerald-400 dark:bg-emerald-400" : "bg-rose-400 dark:bg-rose-400",
            i === 0 && "ring-2 ring-offset-1 ring-offset-white dark:ring-offset-surface-dark-raised",
            i === 0 && r === "W" && "ring-emerald-300/60",
            i === 0 && r === "L" && "ring-rose-300/60"
          )}
        />
      ))}
    </div>
  );
}

export function FormBadge({ streak }: { streak: { type: "W" | "L" | null; length: number } }) {
  if (!streak.type) {
    return <span className="text-xs text-slate-400 dark:text-slate-600">—</span>;
  }
  const isWin = streak.type === "W";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold tabular",
        isWin
          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
          : "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"
      )}
    >
      {streak.type}
      {streak.length}
    </span>
  );
}
