import { Minus, Plus } from "lucide-react";
import type { GameScore } from "../lib/types";

export function ScoreLineInput({
  games,
  onChange,
  p1Label,
  p2Label,
}: {
  games: GameScore[];
  onChange: (games: GameScore[]) => void;
  p1Label: string;
  p2Label: string;
}) {
  function updateGame(i: number, key: "p1" | "p2", value: string) {
    const n = value === "" ? 0 : Math.max(0, Math.min(99, Number(value)));
    const next = games.map((g, idx) => (idx === i ? { ...g, [key]: n } : g));
    onChange(next);
  }

  function addGame() {
    if (games.length >= 9) return;
    onChange([...games, { p1: 0, p2: 0 }]);
  }

  function removeGame(i: number) {
    onChange(games.filter((_, idx) => idx !== i));
  }

  return (
    <div>
      {games.length > 0 && (
        <div className="mb-2 grid grid-cols-[1fr_auto_1fr_28px] items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          <span className="truncate">{p1Label}</span>
          <span />
          <span className="truncate">{p2Label}</span>
          <span />
        </div>
      )}
      <div className="space-y-2">
        {games.map((g, i) => (
          <div key={i} className="grid grid-cols-[1fr_auto_1fr_28px] items-center gap-2">
            <input
              type="number"
              min={0}
              max={99}
              value={g.p1}
              onChange={(e) => updateGame(i, "p1", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm tabular text-slate-900 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
            <span className="text-xs font-semibold text-slate-300 dark:text-slate-600">G{i + 1}</span>
            <input
              type="number"
              min={0}
              max={99}
              value={g.p2}
              onChange={(e) => updateGame(i, "p2", e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm tabular text-slate-900 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
            />
            <button
              type="button"
              onClick={() => removeGame(i)}
              className="flex h-8 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-400/10"
            >
              <Minus size={14} />
            </button>
          </div>
        ))}
      </div>
      {games.length < 9 && (
        <button
          type="button"
          onClick={addGame}
          className="mt-2 inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-accent-600 transition hover:bg-accent-50 dark:text-accent-400 dark:hover:bg-accent-400/10"
        >
          <Plus size={13} /> Add game
        </button>
      )}
    </div>
  );
}
