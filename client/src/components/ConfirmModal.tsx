import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Modal } from "./Modal";

export function ConfirmModal({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal onClose={onClose}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-500 dark:bg-rose-400/10">
          <AlertTriangle size={17} />
        </div>
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h2>
      </div>
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{description}</p>
      <div className="mt-5 flex gap-2.5">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          Cancel
        </button>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className="flex-1 rounded-lg bg-rose-500 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          {confirmLabel}
        </motion.button>
      </div>
    </Modal>
  );
}
