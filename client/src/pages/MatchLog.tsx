import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Pencil, Trash2, ListFilter, X, ListOrdered } from "lucide-react";
import { api, ApiRequestError } from "../lib/api";
import { useData } from "../lib/DataContext";
import { useToast } from "../lib/ToastContext";
import type { Match } from "../lib/types";
import { Avatar } from "../components/Avatar";
import { EmptyState } from "../components/EmptyState";
import { EditMatchModal } from "../components/EditMatchModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { formatDateTime, formatSigned } from "../lib/format";

export function MatchLog() {
  const { players, refresh: refreshStandings } = useData();
  const { showToast } = useToast();

  const [items, setItems] = useState<Match[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [playerFilter, setPlayerFilter] = useState<string>("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [editing, setEditing] = useState<Match | null>(null);
  const [deleting, setDeleting] = useState<Match | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.getMatches({
        playerId: playerFilter ? Number(playerFilter) : undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        pageSize: 15,
      });
      setItems(res.items);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [playerFilter, from, to, page]);

  useEffect(() => {
    setPage(1);
  }, [playerFilter, from, to]);

  useEffect(() => {
    load();
  }, [load]);

  const activeFilters = Boolean(playerFilter || from || to);

  async function handleDelete(match: Match) {
    try {
      await api.deleteMatch(match.id);
      showToast("Match deleted");
      await Promise.all([load(), refreshStandings()]);
    } catch (e) {
      showToast(e instanceof ApiRequestError ? e.message : "Couldn't delete match.", "error");
    }
  }

  async function handleEditSubmit(data: {
    player1Id: number;
    player2Id: number;
    winnerId: number;
    playedAt: string;
    games: Match["games"];
    notes: string | null;
  }) {
    if (!editing) return;
    await api.updateMatch(editing.id, data);
    showToast("Match updated");
    setEditing(null);
    await Promise.all([load(), refreshStandings()]);
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
            Match Log
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{total} matches recorded</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold shadow-card transition ${
              activeFilters
                ? "border-accent-300 bg-accent-50 text-accent-700 dark:border-accent-400/40 dark:bg-accent-400/10 dark:text-accent-300"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-white/10 dark:bg-surface-dark-raised dark:text-slate-200"
            }`}
          >
            <ListFilter size={15} />
            Filters
            {activeFilters && <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />}
          </button>
          <a
            href="/api/export/matches.csv"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:border-slate-300 dark:border-white/10 dark:bg-surface-dark-raised dark:text-slate-200"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Export</span>
          </a>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-5 overflow-hidden"
          >
            <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200/70 bg-white p-4 shadow-card dark:border-white/5 dark:bg-surface-dark-raised">
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  Player
                </label>
                <select
                  value={playerFilter}
                  onChange={(e) => setPlayerFilter(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-accent-400 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                >
                  <option value="">All players</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  From
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-accent-400 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  To
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-accent-400 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
                />
              </div>
              {activeFilters && (
                <button
                  onClick={() => {
                    setPlayerFilter("");
                    setFrom("");
                    setTo("");
                  }}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
                >
                  <X size={13} /> Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-white/[0.03]" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<ListOrdered size={24} />}
          title={activeFilters ? "No matches match your filters" : "No matches logged yet"}
          description={
            activeFilters
              ? "Try widening your date range or picking a different player."
              : "Log your first match to start building the league's history."
          }
          actionLabel={activeFilters ? undefined : "Log a match"}
          actionTo={activeFilters ? undefined : "/new"}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((m) => (
            <MatchRow key={m.id} match={m} onEdit={() => setEditing(m)} onDelete={() => setDeleting(m)} />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition disabled:opacity-30 hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
          >
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 transition disabled:opacity-30 hover:bg-slate-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {editing && (
        <EditMatchModal match={editing} onClose={() => setEditing(null)} onSubmit={handleEditSubmit} />
      )}
      {deleting && (
        <ConfirmModal
          title="Delete this match?"
          description={`This will remove the match between ${deleting.player1?.name} and ${deleting.player2?.name} and recalculate all stats. This can't be undone.`}
          onConfirm={() => handleDelete(deleting)}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  );
}

function MatchRow({ match, onEdit, onDelete }: { match: Match; onEdit: () => void; onDelete: () => void }) {
  const p1IsWinner = match.player1?.id === match.winnerId;
  return (
    <div className="group flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3.5 shadow-card transition hover:shadow-card-hover sm:p-4 dark:border-white/5 dark:bg-surface-dark-raised">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
        <PlayerBlock name={match.player1?.name} color={match.player1?.color} id={match.player1?.id} isWinner={p1IsWinner} />
        <span className="shrink-0 text-xs font-bold text-slate-300 dark:text-slate-600">vs</span>
        <PlayerBlock
          name={match.player2?.name}
          color={match.player2?.color}
          id={match.player2?.id}
          isWinner={!p1IsWinner}
        />
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        {match.games && (
          <div className="flex gap-1 text-xs tabular text-slate-500 dark:text-slate-400">
            {match.games.map((g, i) => (
              <span key={i} className="rounded bg-slate-50 px-1.5 py-0.5 dark:bg-white/5">
                {g.p1}-{g.p2}
              </span>
            ))}
          </div>
        )}
        <span className="text-xs text-slate-400 dark:text-slate-500">{formatDateTime(match.playedAt)}</span>
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100">
        <button
          onClick={onEdit}
          title="Edit match"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-accent-50 hover:text-accent-600 dark:hover:bg-accent-400/10 dark:hover:text-accent-400"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          title="Delete match"
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-400/10"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function PlayerBlock({
  name,
  color,
  id,
  isWinner,
}: {
  name?: string;
  color?: string;
  id?: number;
  isWinner: boolean;
}) {
  if (!name || !color || !id) return <span className="text-sm text-slate-400">Unknown</span>;
  return (
    <Link to={`/players/${id}`} className="flex min-w-0 items-center gap-2">
      <Avatar name={name} color={color} size="sm" />
      <span
        className={`truncate text-sm ${
          isWinner
            ? "font-bold text-slate-900 dark:text-slate-100"
            : "font-medium text-slate-400 dark:text-slate-500"
        }`}
      >
        {name}
      </span>
    </Link>
  );
}
