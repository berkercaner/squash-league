import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarClock, CheckCircle2, ChevronDown, Swords, UserPlus } from "lucide-react";
import { useData } from "../lib/DataContext";
import { useToast } from "../lib/ToastContext";
import { api, ApiRequestError } from "../lib/api";
import { PlayerPicker } from "../components/PlayerPicker";
import { Avatar } from "../components/Avatar";
import { ScoreLineInput } from "../components/ScoreLineInput";
import { AddPlayerModal } from "../components/AddPlayerModal";
import { EmptyState } from "../components/EmptyState";
import type { GameScore } from "../lib/types";
import { cn } from "../lib/format";

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MatchEntry() {
  const { players, refresh } = useData();
  const { showToast } = useToast();

  const [player1Id, setPlayer1Id] = useState<number | null>(null);
  const [player2Id, setPlayer2Id] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);
  const [playedAt, setPlayedAt] = useState(nowLocal());
  const [showScores, setShowScores] = useState(false);
  const [games, setGames] = useState<GameScore[]>([]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [justLogged, setJustLogged] = useState<{ winner: string; loser: string; score: string } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const player1 = players.find((p) => p.id === player1Id) || null;
  const player2 = players.find((p) => p.id === player2Id) || null;

  function pickPlayer1(id: number) {
    setPlayer1Id(id);
    if (id === player2Id) setPlayer2Id(null);
    if (winnerId && winnerId !== id && winnerId !== player2Id) setWinnerId(null);
    else if (winnerId === player2Id && id === player2Id) setWinnerId(null);
  }
  function pickPlayer2(id: number) {
    setPlayer2Id(id);
    if (id === player1Id) setPlayer1Id(null);
  }

  function reset() {
    setPlayer1Id(null);
    setPlayer2Id(null);
    setWinnerId(null);
    setPlayedAt(nowLocal());
    setShowScores(false);
    setGames([]);
    setNotes("");
    setFormError(null);
  }

  async function handleAddPlayer(name: string, nickname: string) {
    try {
      const p = await api.createPlayer({ name, nickname: nickname || null });
      await refresh();
      showToast(`${name} joined the league`);
      setShowAddPlayer(false);
      if (!player1Id) setPlayer1Id(p.id);
      else if (!player2Id) setPlayer2Id(p.id);
    } catch (e) {
      showToast(e instanceof ApiRequestError ? e.message : "Couldn't add player.", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setJustLogged(null);

    if (!player1Id || !player2Id) {
      setFormError("Choose both players.");
      return;
    }
    if (player1Id === player2Id) {
      setFormError("A player can't play against themselves.");
      return;
    }
    if (!winnerId) {
      setFormError("Choose who won.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createMatch({
        player1Id,
        player2Id,
        winnerId,
        playedAt: new Date(playedAt).toISOString(),
        games: showScores && games.length ? games : null,
        notes: notes.trim() || null,
      });
      await refresh();
      const winner = winnerId === player1Id ? player1 : player2;
      const loser = winnerId === player1Id ? player2 : player1;
      const scoreStr =
        showScores && games.length ? games.map((g) => `${g.p1}-${g.p2}`).join(", ") : "no score recorded";
      setJustLogged({ winner: winner!.name, loser: loser!.name, score: scoreStr });
      showToast(`Match logged: ${winner!.name} defeated ${loser!.name}`);
      reset();
    } catch (e) {
      setFormError(e instanceof ApiRequestError ? e.message : "Couldn't log the match.");
    } finally {
      setSubmitting(false);
    }
  }

  if (players.length < 2) {
    return (
      <div className="animate-fade-in">
        <h1 className="mb-6 font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Log Match
        </h1>
        <EmptyState
          icon={<UserPlus size={24} />}
          title="Need at least two players"
          description="Add a second player to your league before you can log a match."
          actionLabel="Add a player"
          onAction={() => setShowAddPlayer(true)}
        />
        {showAddPlayer && <AddPlayerModal onClose={() => setShowAddPlayer(false)} onSubmit={handleAddPlayer} />}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">
          Log Match
        </h1>
        <button
          onClick={() => setShowAddPlayer(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-card transition hover:border-accent-300 hover:text-accent-600 dark:border-white/10 dark:bg-surface-dark-raised dark:text-slate-200"
        >
          <UserPlus size={15} />
          New Player
        </button>
      </div>

      <AnimatePresence>
        {justLogged && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
          >
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 size={16} />
              Match logged
            </div>
            <p className="mt-0.5 text-emerald-700/80 dark:text-emerald-300/70">
              {justLogged.winner} defeated {justLogged.loser} · {justLogged.score}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-5">
        <Section title="Player 1" step={1}>
          <PlayerPicker players={players} value={player1Id} onChange={pickPlayer1} exclude={player2Id} />
        </Section>

        <Section title="Player 2" step={2}>
          <PlayerPicker players={players} value={player2Id} onChange={pickPlayer2} exclude={player1Id} />
        </Section>

        {player1 && player2 && (
          <Section title="Winner" step={3}>
            <div className="grid grid-cols-2 gap-3">
              {[player1, player2].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setWinnerId(p.id)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition active:scale-[0.98]",
                    winnerId === p.id
                      ? "border-accent-400 bg-accent-50 shadow-glow dark:border-accent-400/60 dark:bg-accent-400/10"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-surface-dark dark:hover:border-white/20"
                  )}
                >
                  <Avatar name={p.name} color={p.color} size="lg" />
                  <span className="text-center text-sm font-bold text-slate-800 dark:text-slate-100">{p.name}</span>
                  {winnerId === p.id && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-accent-600 dark:text-accent-400">
                      <Swords size={12} /> Winner
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Section>
        )}

        <Section title="Date &amp; Time" step={4} icon={<CalendarClock size={15} />}>
          <input
            type="datetime-local"
            value={playedAt}
            max={nowLocal()}
            onChange={(e) => setPlayedAt(e.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
          />
        </Section>

        <Section title="Score line" step={5} optional>
          <button
            type="button"
            onClick={() => {
              setShowScores((v) => !v);
              if (!showScores && games.length === 0) setGames([{ p1: 0, p2: 0 }]);
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-accent-600 dark:text-accent-400"
          >
            <ChevronDown size={15} className={cn("transition-transform", showScores && "rotate-180")} />
            {showScores ? "Hide game scores" : "Add game scores (e.g. 11–7, 11–9)"}
          </button>
          <AnimatePresence>
            {showScores && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden pt-3"
              >
                <ScoreLineInput
                  games={games}
                  onChange={setGames}
                  p1Label={player1?.name ?? "Player 1"}
                  p2Label={player2?.name ?? "Player 2"}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section title="Notes" step={6} optional>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional — e.g. court 2, great rally in game 3"
            maxLength={300}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
          />
        </Section>

        {formError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300">
            {formError}
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-accent-500 py-3.5 text-sm font-bold text-white shadow-glow transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8"
        >
          {submitting ? "Logging…" : "Log Match"}
        </motion.button>
      </form>

      {showAddPlayer && <AddPlayerModal onClose={() => setShowAddPlayer(false)} onSubmit={handleAddPlayer} />}
    </div>
  );
}

function Section({
  title,
  step,
  children,
  optional,
  icon,
}: {
  title: string;
  step: number;
  children: React.ReactNode;
  optional?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-card dark:border-white/5 dark:bg-surface-dark-raised sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-[11px] font-bold text-slate-500 dark:bg-white/5 dark:text-slate-400">
          {step}
        </span>
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">{title}</h3>
        {icon}
        {optional && <span className="text-xs font-normal text-slate-400 dark:text-slate-500">optional</span>}
      </div>
      {children}
    </div>
  );
}
