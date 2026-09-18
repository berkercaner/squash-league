export function WinPctBar({ pct, className = "" }: { pct: number; className?: string }) {
  const clamped = Math.min(100, Math.max(0, pct * 100));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/5 ${className}`}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-accent-500 to-accent-400 transition-[width] duration-700 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
