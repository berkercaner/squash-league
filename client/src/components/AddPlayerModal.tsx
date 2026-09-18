import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, X } from "lucide-react";
import { Modal } from "./Modal";

export function AddPlayerModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (name: string, nickname: string) => Promise<void> | void;
}) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit(name.trim(), nickname.trim());
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-500 dark:bg-accent-400/10">
            <UserPlus size={17} />
          </div>
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">Add Player</h2>
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
            Name
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Rivera"
            maxLength={60}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Nickname <span className="normal-case text-slate-400">(optional)</span>
          </label>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. The Wall"
            maxLength={40}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-accent-400 focus:ring-2 focus:ring-accent-400/20 dark:border-white/10 dark:bg-surface-dark dark:text-slate-100"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={!name.trim() || submitting}
          className="w-full rounded-lg bg-accent-500 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add Player"}
        </motion.button>
      </form>
    </Modal>
  );
}
