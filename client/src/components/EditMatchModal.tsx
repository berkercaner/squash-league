import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, X } from "lucide-react";
import { Modal } from "./Modal";
import { PlayerPicker } from "./PlayerPicker";
import { Avatar } from "./Avatar";
import { ScoreLineInput } from "./ScoreLineInput";
import { useData } from "../lib/DataContext";
import type { GameScore, Match } from "../lib/types";
import { toDatetimeLocalValue, cn } from "../lib/format";

export function EditMatchModal({
  match,
  onClose,
  onSubmit,
}: {
  match: Match;
  onClose: () => void;
  onSubmit: (data: {
    player1Id: number;
    player2Id: number;
    winnerId: number;
    playedAt: string;
    games: GameScore[] | null;
    notes: string | null;
  }) => Promise<void> | void;
}) {
  const { players } = useData();
  const [player1Id, setPlayer1Id] = useState<number | null>(match.player1?.id ?? null);
  const [player2Id, setPlayer2Id] = useState<number | null>(match.player2?.id ?? null);
  const [winnerId, setWinnerId] = useState<number | null>(match.winnerId);
  const [playedAt, setPlayedAt] = useState(toDatetimeLocalValue(match.playedAt));
  const [games, setGames] = useState<GameScore[]>(match.games ?? []);
  const [showScores, setShowScores] = useState(!!match.games?.length);
  const [notes, setNotes] = useState(match.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const player1 = players.find((p) => p.id === player1Id) || null;
  const player2 = players.find((p) => p.id === player2Id) || null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!player1Id || !player2Id) return setError("Choose both players.");
    if (player1Id === player2Id) return setError("A player can't play against themselves.");
    if (!winnerId) return setError("Choose who won.");

    setSubmitting(true);
    try {
      await onSubmit({
        player1Id,
        player2Id,
        winnerId,
        playedAt: new Date(playedAt).toISOString(),
        games: showScores && games.length ? games : null,
        notes: notes.trim() || null,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save changes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-500 dark:bg-accent-400/10">
            <Pencil size={15} />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Edit Match</h2>
        </div>
        <button
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Player 1
          </label>
          <PlayerPicker
            players={players}
            value={player1Id}
            onChange={(id) => {
              setPlayer1Id(id);
              if (id === player2Id) setPlayer2Id(null);
            }}
            exclude={player2Id}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Player 2
          </label>
          <PlayerPicker
            players={players}
            value={player2Id}
            onChange={(id) => {
              setPlayer2Id(id);
              if (id === player1Id) setPlayer1Id(null);
            }}
            exclude={player1Id}
          />
        </div>

        {player1 && player2 && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Winner
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[player1, player2].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setWinnerId(p.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition",
                    winnerId === p.id
                      ? "border-accent-400 bg-accent-50 text-accent-700 dark:border-accent-400/60 dark:bg-accent-400/10 dark:text-accent-300"
                      : "border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-surface-dark dark:text-slate-300"
                  )}
                >
                  <Avatar name={p.name} color={p.color} size="sm" />
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Date &amp; time
          </label>
          <input
            type="datetime-local"
            value={playedAt}
            onChange={(e) => setPlayedAt(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowScores((v) => !v)}
            className="text-sm font-semibold text-accent-600 dark:text-accent-400"
          >
            {showScores ? "Hide game scores" : "Add game scores"}
          </button>
          {showScores && (
            <div className="pt-3">
              <ScoreLineInput
                games={games}
                onChange={setGames}
                p1Label={player1?.name ?? "Player 1"}
                p2Label={player2?.name ?? "Player 2"}
              />
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Notes
          </label>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={300}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
          />
        </div>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-600 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save Changes"}
        </motion.button>
      </form>
    </Modal>
  );
}
