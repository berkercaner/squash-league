import type { ReactNode } from "react";
import { cn } from "../lib/format";

export function StatTile({
  label,
  value,
  sub,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  icon?: ReactNode;
  tone?: "neutral" | "positive" | "negative";
}) {
  return (
    <div className="rounded-xl border border-slate-200/70 bg-white p-4 shadow-card dark:border-white/5 dark:bg-surface-dark-raised">
      <div className="flex items-center justify-between text-slate-400 dark:text-slate-500">
        <span className="text-[11px] font-semibold uppercase tracking-wide">{label}</span>
        {icon}
      </div>
      <div
        className={cn(
          "mt-1.5 font-display text-2xl font-extrabold tabular",
          tone === "positive" && "text-emerald-500",
          tone === "negative" && "text-rose-500",
          tone === "neutral" && "text-slate-900 dark:text-slate-50"
        )}
      >
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</div>}
    </div>
  );
}
