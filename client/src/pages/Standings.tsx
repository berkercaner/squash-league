import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Trophy, UserPlus, Users } from "lucide-react";
import { useData } from "../lib/DataContext";
import { useToast } from "../lib/ToastContext";
import { api, ApiRequestError } from "../lib/api";
import { Avatar } from "../components/Avatar";
import { RankBadge } from "../components/RankBadge";
import { FormDots, FormBadge } from "../components/FormDots";
import { Sparkline } from "../components/Sparkline";
import { WinPctBar } from "../components/WinPctBar";
import { EmptyState } from "../components/EmptyState";
import { formatPct, formatSigned } from "../lib/format";
import { AddPlayerModal } from "../components/AddPlayerModal";

function rowTint(rank: number) {
  if (rank === 1)
    return "bg-gradient-to-r from-amber-50/80 via-amber-50/30 to-transparent dark:from-amber-400/[0.07] dark:via-amber-400/[0.02] dark:to-transparent";
  if (rank === 2) return "bg-slate-50/60 dark:bg-white/[0.02]";
  if (rank === 3) return "bg-orange-50/40 dark:bg-orange-400/[0.04]";
  return "";
}

export function Standings() {
  const { standings, players, loading, error, refresh } = useData();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  async function handleAddPlayer(name: string, nickname: string) {
    try {
      await api.createPlayer({ name, nickname: nickname || null });
      await refresh();
      showToast(`${name} joined the league`);
      setShowAddPlayer(false);
    } catch (e) {
      showToast(e instanceof ApiRequestError ? e.message : "Couldn't add player.", "error");
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Standings
          </h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
            <Users size={14} />
            {players.length} player{players.length === 1 ? "" : "s"} · ranked by score
          </p>
        </div>
        <button
          onClick={() => setShowAddPlayer(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:border-accent-300 hover:text-accent-600 active:scale-[0.98] dark:border-white/10 dark:bg-surface-dark-raised dark:text-slate-200 dark:hover:border-accent-400/40"
        >
          <UserPlus size={15} />
          Add Player
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
          {error}
        </div>
      )}

      {loading ? (
        <StandingsSkeleton />
      ) : standings.length === 0 ? (
        <EmptyState
          icon={<Trophy size={24} />}
          title="No standings yet"
          description="Add a couple of players and log your first match to kick off the league table."
          actionLabel="Add your first player"
          onAction={() => setShowAddPlayer(true)}
        />
      ) : (
        <>
          {/* Desktop / tablet table */}
          <div className="hidden overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-card md:block dark:border-white/5 dark:bg-surface-dark-raised">
            <div className="grid grid-cols-[48px_1.7fr_70px_1fr_70px_60px_1fr_90px_24px] items-center gap-3 border-b border-slate-100 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:border-white/5 dark:text-slate-500">
              <span>Rank</span>
              <span>Player</span>
              <span className="text-right">Score</span>
              <span>Trend</span>
              <span className="text-center">W–L</span>
              <span className="text-center">Mp</span>
              <span>Win %</span>
              <span>Streak</span>
              <span />
            </div>
            <AnimatePresence initial={false}>
              {standings.map((s) => (
                <motion.div
                  key={s.playerId}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: 0.25 } }}
                  onClick={() => navigate(`/players/${s.playerId}`)}
                  className={`grid cursor-pointer grid-cols-[48px_1.7fr_70px_1fr_70px_60px_1fr_90px_24px] items-center gap-3 border-b border-slate-50 px-5 py-3.5 transition-colors last:border-b-0 hover:bg-accent-50/50 dark:border-white/[0.03] dark:hover:bg-white/[0.03] ${rowTint(
                    s.rank
                  )}`}
                >
                  <RankBadge rank={s.rank} />

                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={s.playerName} color={s.player.color} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-slate-900 dark:text-slate-100">{s.playerName}</div>
                      {s.player.nickname && (
                        <div className="truncate text-xs text-slate-400 dark:text-slate-500">
                          "{s.player.nickname}"
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    className={`text-right font-display text-lg font-extrabold tabular ${
                      s.score > 0 ? "text-emerald-500" : s.score < 0 ? "text-rose-500" : "text-slate-400"
                    }`}
                  >
                    {formatSigned(s.score)}
                  </div>

                  <Sparkline series={s.series} color={s.player.color} height={32} />

                  <div className="text-center tabular">
                    <span className="font-bold text-slate-800 dark:text-slate-100">{s.wins}</span>
                    <span className="mx-1 text-slate-300 dark:text-slate-600">–</span>
                    <span className="font-bold text-slate-400 dark:text-slate-500">{s.losses}</span>
                  </div>

                  <div className="text-center tabular text-slate-500 dark:text-slate-400">{s.totalMatches}</div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs tabular">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {formatPct(s.winPct)}
                      </span>
                    </div>
                    <WinPctBar pct={s.winPct} />
                  </div>

                  <div className="flex flex-col items-start gap-1.5">
                    <FormBadge streak={s.currentStreak} />
                    <FormDots form={s.recentForm.slice(0, 5)} size="xs" />
                  </div>

                  <ChevronRight size={16} className="text-slate-300 dark:text-slate-600" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Mobile cards */}
          <div className="space-y-2.5 md:hidden">
            <AnimatePresence initial={false}>
              {standings.map((s) => (
                <motion.div
                  key={s.playerId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
                  onClick={() => navigate(`/players/${s.playerId}`)}
                  className={`rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card active:scale-[0.98] transition-transform dark:border-white/5 dark:bg-surface-dark-raised ${rowTint(
                    s.rank
                  )}`}
                >
                  <div className="flex items-center gap-3">
                    <RankBadge rank={s.rank} />
                    <Avatar name={s.playerName} color={s.player.color} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-900 dark:text-slate-100">
                        {s.playerName}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                        <span className="tabular">
                          {s.wins}W – {s.losses}L
                        </span>
                        <span>·</span>
                        <span className="tabular">{formatPct(s.winPct)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`font-display text-xl font-extrabold tabular ${
                          s.score > 0 ? "text-emerald-500" : s.score < 0 ? "text-rose-500" : "text-slate-400"
                        }`}
                      >
                        {formatSigned(s.score)}
                      </div>
                      <FormBadge streak={s.currentStreak} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1">
                      <Sparkline series={s.series} color={s.player.color} height={28} />
                    </div>
                    <FormDots form={s.recentForm.slice(0, 5)} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      {showAddPlayer && (
        <AddPlayerModal onClose={() => setShowAddPlayer(false)} onSubmit={handleAddPlayer} />
      )}
    </div>
  );
}

function StandingsSkeleton() {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.03]" />
      ))}
    </div>
  );
}
