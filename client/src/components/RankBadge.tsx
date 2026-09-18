import { Crown, Medal } from "lucide-react";
import { cn } from "../lib/format";

export function RankBadge({ rank, size = "md" }: { rank: number; size?: "sm" | "md" }) {
  const dims = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconDims = size === "sm" ? 12 : 15;

  if (rank === 1) {
    return (
      <div
        className={cn(
          dims,
          "flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-900 shadow-[0_0_0_1px_rgba(245,158,11,0.35),0_4px_12px_-2px_rgba(245,158,11,0.55)]"
        )}
      >
        <Crown size={iconDims} strokeWidth={2.5} fill="currentColor" />
      </div>
    );
  }
  if (rank === 2) {
    return (
      <div
        className={cn(
          dims,
          "flex items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 text-slate-700 shadow-[0_2px_8px_-2px_rgba(100,116,139,0.5)]"
        )}
      >
        <Medal size={iconDims} strokeWidth={2.5} />
      </div>
    );
  }
  if (rank === 3) {
    return (
      <div
        className={cn(
          dims,
          "flex items-center justify-center rounded-full bg-gradient-to-br from-orange-300 to-orange-500 text-orange-900 shadow-[0_2px_8px_-2px_rgba(249,115,22,0.5)]"
        )}
      >
        <Medal size={iconDims} strokeWidth={2.5} />
      </div>
    );
  }
  return (
    <div
      className={cn(
        dims,
        "flex items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-bold tabular dark:bg-white/5 dark:text-slate-400"
      )}
    >
      {rank}
    </div>
  );
}
