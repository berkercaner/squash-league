import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Swords,
  Trophy,
  Target,
  Percent,
  Gauge,
  Snowflake,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
} from "lucide-react";
import { api } from "../lib/api";
import type { PlayerDetail as PlayerDetailType } from "../lib/types";
import { Avatar } from "../components/Avatar";
import { RankBadge } from "../components/RankBadge";
import { FormDots, FormBadge } from "../components/FormDots";
import { WinPctBar } from "../components/WinPctBar";
import { TrendChart } from "../components/TrendChart";
import { StatTile } from "../components/StatTile";
import { formatDate, formatPct, formatSigned } from "../lib/format";

export function PlayerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const playerId = Number(id);

  const [detail, setDetail] = useState<PlayerDetailType | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(
    async (p: number) => {
      setLoading(true);
      try {
        const d = await api.getPlayerDetail(playerId, p);
        setDetail(d);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    },
    [playerId]
  );

  useEffect(() => {
    setPage(1);
    load(1);
  }, [playerId, load]);

  useEffect(() => {
    if (page !== 1) load(page);
  }, [page, load]);

  if (notFound) {
    return (
      <div className="py-20 text-center text-slate-500 dark:text-slate-400">
        Player not found.{" "}
        <Link to="/" className="font-semibold text-accent-500">
          Back to standings
        </Link>
      </div>
    );
  }

  if (loading && !detail) {
    return <DetailSkeleton />;
  }
  if (!detail) return null;

  const { player, stats, trending, headToHead, history, rank, playerCount } = detail;

  return (
    <div className="animate-fade-in pb-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={15} /> Back
      </button>

      {/* Header */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-white/5 dark:bg-surface-dark-raised sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={player.name} color={player.color} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                  {player.name}
                </h1>
                {rank && <RankBadge rank={rank} size="sm" />}
              </div>
              {player.nickname && (
                <div className="text-sm text-slate-400 dark:text-slate-500">"{player.nickname}"</div>
              )}
              <div className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                <span>
                  Rank {rank ?? "—"} of {playerCount}
                </span>
                <span>·</span>
                <FormBadge streak={stats.currentStreak} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 sm:gap-8">
            <div className="text-left sm:text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Score
              </div>
              <div
                className={`font-display text-3xl font-extrabold tabular ${
                  stats.score > 0 ? "text-emerald-500" : stats.score < 0 ? "text-rose-500" : "text-slate-400"
                }`}
              >
                {formatSigned(stats.score)}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Record
              </div>
              <div className="font-display text-3xl font-extrabold tabular text-slate-800 dark:text-slate-100">
                {stats.wins}
                <span className="text-slate-300 dark:text-slate-600">–</span>
                {stats.losses}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <FormDots form={stats.recentForm} size="md" />
          <span className="text-xs text-slate-400 dark:text-slate-500">recent form</span>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatTile label="Matches" value={stats.totalMatches} icon={<CalendarClock size={14} />} />
        <StatTile
          label="Win %"
          value={formatPct(stats.winPct)}
          icon={<Percent size={14} />}
          sub={<WinPctBar pct={stats.winPct} />}
        />
        <StatTile
          label="Win Streak"
          value={stats.longestWinStreak}
          icon={<Flame size={14} />}
          tone={stats.longestWinStreak > 0 ? "positive" : "neutral"}
          sub="longest all-time"
        />
        <StatTile
          label="Loss Streak"
          value={stats.longestLossStreak}
          icon={<Snowflake size={14} />}
          tone={stats.longestLossStreak > 0 ? "negative" : "neutral"}
          sub="longest all-time"
        />
        <StatTile label="Peak Score" value={formatSigned(stats.peakScore)} icon={<Gauge size={14} />} />
        <StatTile
          label="Avg Margin"
          value={stats.avgMarginOfVictory != null ? `+${stats.avgMarginOfVictory.toFixed(1)}` : "—"}
          icon={<Target size={14} />}
          sub="points, on wins"
        />
      </div>

      {/* Trend */}
      <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-white/5 dark:bg-surface-dark-raised">
        <h2 className="mb-3 font-display text-base font-bold text-slate-800 dark:text-slate-100">Score Trend</h2>
        <TrendChart series={trending} color={player.color} />
      </div>

      {/* Best / worst matchups */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <MatchupCard
          kind="favorite"
          entry={headToHead.favorite}
          emptyText="No dominant matchup yet — keep playing!"
        />
        <MatchupCard kind="nemesis" entry={headToHead.nemesis} emptyText="No nemesis yet — clean record!" />
      </div>

      {/* Full head-to-head */}
      {headToHead.list.length > 0 && (
        <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-white/5 dark:bg-surface-dark-raised">
          <h2 className="mb-3 font-display text-base font-bold text-slate-800 dark:text-slate-100">
            Head-to-Head
          </h2>
          <div className="space-y-1">
            {headToHead.list.map((h) => (
              <Link
                key={h.opponentId}
                to={`/players/${h.opponentId}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50 dark:hover:bg-white/5"
              >
                {h.opponent && <Avatar name={h.opponent.name} color={h.opponent.color} size="sm" />}
                <span className="flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                  {h.opponent?.name ?? "Unknown"}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">{h.matches} played</span>
                <span
                  className={`w-16 text-right text-sm font-bold tabular ${
                    h.net > 0 ? "text-emerald-500" : h.net < 0 ? "text-rose-500" : "text-slate-400"
                  }`}
                >
                  {h.wins}–{h.losses}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Match history */}
      <div className="mt-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-white/5 dark:bg-surface-dark-raised">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-bold text-slate-800 dark:text-slate-100">Match History</h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">{history.total} total</span>
        </div>

        {history.items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400 dark:text-slate-500">No matches recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-white/[0.03]">
            {history.items.map((h) => (
              <div key={h.matchId} className="flex items-center gap-3 py-3">
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-extrabold ${
                    h.isWin
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"
                  }`}
                >
                  {h.isWin ? "W" : "L"}
                </span>
                {h.opponent && (
                  <Link to={`/players/${h.opponent.id}`} className="shrink-0">
                    <Avatar name={h.opponent.name} color={h.opponent.color} size="sm" />
                  </Link>
                )}
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    vs {h.opponent?.name ?? "Unknown"}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500">{formatDate(h.playedAt)}</div>
                </div>
                {h.games && (
                  <div className="hidden shrink-0 gap-1 text-xs tabular text-slate-400 dark:text-slate-500 sm:flex">
                    {h.games.map((g, i) => (
                      <span key={i} className="rounded bg-slate-50 px-1.5 py-0.5 dark:bg-white/5">
                        {g.p1}-{g.p2}
                      </span>
                    ))}
                  </div>
                )}
                {h.margin != null && (
                  <span
                    className={`w-12 shrink-0 text-right text-xs font-bold tabular ${
                      h.margin > 0 ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {formatSigned(h.margin)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {history.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-white/5">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition disabled:opacity-30 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Page {history.page} of {history.totalPages}
            </span>
            <button
              disabled={page >= history.totalPages}
              onClick={() => setPage((p) => Math.min(history.totalPages, p + 1))}
              className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 transition disabled:opacity-30 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MatchupCard({
  kind,
  entry,
  emptyText,
}: {
  kind: "favorite" | "nemesis";
  entry: PlayerDetailType["headToHead"]["favorite"];
  emptyText: string;
}) {
  const isFav = kind === "favorite";
  return (
    <div
      className={`rounded-2xl border p-5 shadow-card ${
        isFav
          ? "border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-400/10 dark:bg-emerald-400/[0.04]"
          : "border-rose-200/60 bg-rose-50/40 dark:border-rose-400/10 dark:bg-rose-400/[0.04]"
      }`}
    >
      <div className="mb-3 flex items-center gap-2">
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            isFav
              ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
              : "bg-rose-100 text-rose-600 dark:bg-rose-400/10 dark:text-rose-400"
          }`}
        >
          {isFav ? <Trophy size={16} /> : <Swords size={16} />}
        </div>
        <div>
          <div className="font-display text-sm font-bold text-slate-800 dark:text-slate-100">
            {isFav ? "Favorite Opponent" : "Nemesis"}
          </div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            {isFav ? "best head-to-head record" : "toughest head-to-head record"}
          </div>
        </div>
      </div>

      {entry ? (
        <Link
          to={`/players/${entry.opponentId}`}
          className="flex items-center gap-3 rounded-xl bg-white/70 p-3 transition hover:bg-white dark:bg-white/5 dark:hover:bg-white/10"
        >
          {entry.opponent && <Avatar name={entry.opponent.name} color={entry.opponent.color} size="md" />}
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
              {entry.opponent?.name}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{entry.matches} matches played</div>
          </div>
          <div
            className={`font-display text-lg font-extrabold tabular ${
              isFav ? "text-emerald-500" : "text-rose-500"
            }`}
          >
            {entry.wins}–{entry.losses}
          </div>
        </Link>
      ) : (
        <p className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">{emptyText}</p>
      )}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.03]" />
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.03]" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-2xl bg-slate-100 dark:bg-white/[0.03]" />
    </div>
  );
}
