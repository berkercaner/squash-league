import type { Player } from "../lib/types";
import { Avatar } from "./Avatar";
import { cn } from "../lib/format";

export function PlayerPicker({
  players,
  value,
  onChange,
  exclude,
}: {
  players: Player[];
  value: number | null;
  onChange: (id: number) => void;
  exclude?: number | null;
}) {
  const available = players.filter((p) => p.id !== exclude);

  if (available.length === 0) {
    return <p className="text-sm text-slate-400 dark:text-slate-500">No other players available yet.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {available.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition active:scale-[0.97]",
            value === p.id
              ? "border-accent-400 bg-accent-50 text-accent-700 ring-2 ring-accent-400/25 dark:border-accent-400/50 dark:bg-accent-400/10 dark:text-accent-300"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-white/10 dark:bg-surface-dark dark:text-slate-300 dark:hover:bg-white/5"
          )}
        >
          <Avatar name={p.name} color={p.color} size="sm" />
          {p.name}
        </button>
      ))}
    </div>
  );
}
