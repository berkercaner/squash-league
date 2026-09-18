import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, RefreshCcw } from "lucide-react";
import { api } from "../lib/api";
import type { StandingEntry } from "../lib/types";
import { Avatar } from "../components/Avatar";
import { RankBadge } from "../components/RankBadge";
import { FormDots } from "../components/FormDots";
import { formatSigned } from "../lib/format";

const REFRESH_MS = 15000;

export function Leaderboard() {
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    document.documentElement.classList.add("dark");
    let cancelled = false;

    async function load() {
      try {
        const s = await api.getStandings();
        if (!cancelled) {
          setStandings(s);
          setLastUpdated(new Date());
        }
      } catch {
        // silently retry on next tick
      }
    }
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#0f1729,_#05070d)] px-6 py-10 text-white sm:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 shadow-glow">
              <Trophy size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight">League Standings</h1>
              <p className="text-sm text-slate-400">Live leaderboard · auto-refreshing</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <RefreshCcw size={14} className="animate-spin [animation-duration:3s]" />
            {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {standings.map((s) => (
              <motion.div
                key={s.playerId}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ layout: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
                className={`flex items-center gap-5 rounded-2xl border px-6 py-4 ${
                  s.rank === 1
                    ? "border-amber-400/30 bg-amber-400/[0.08]"
                    : "border-white/5 bg-white/[0.03]"
                }`}
              >
                <RankBadge rank={s.rank} />
                <Avatar name={s.playerName} color={s.player.color} size="lg" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-2xl font-bold">{s.playerName}</div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-slate-400">
                    <span className="tabular">
                      {s.wins}W – {s.losses}L
                    </span>
                    <FormDots form={s.recentForm.slice(0, 8)} size="sm" />
                  </div>
                </div>
                <div
                  className={`font-display text-4xl font-extrabold tabular ${
                    s.score > 0 ? "text-emerald-400" : s.score < 0 ? "text-rose-400" : "text-slate-500"
                  }`}
                >
                  {formatSigned(s.score)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {standings.length === 0 && (
          <p className="py-20 text-center text-slate-500">Waiting for standings…</p>
        )}
      </div>
    </div>
  );
}
