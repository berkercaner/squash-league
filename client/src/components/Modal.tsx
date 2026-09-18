import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";

export function Modal({ onClose, children }: { onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
      />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ type: "spring", damping: 28, stiffness: 340 }}
        className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-card-hover sm:rounded-2xl sm:p-6 dark:border-white/10 dark:bg-surface-dark-raised"
      >
        {children}
      </motion.div>
    </div>,
    document.body
  );
}
