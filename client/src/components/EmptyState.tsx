import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-50 text-accent-500 dark:bg-accent-400/10">
        {icon}
      </div>
      <h3 className="font-display text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-600 active:scale-[0.98]"
        >
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-600 active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
