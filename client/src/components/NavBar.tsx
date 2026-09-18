import { NavLink } from "react-router-dom";
import { Trophy, PlusCircle, ListOrdered, Monitor, Moon, Sun, Download } from "lucide-react";
import { useTheme } from "../hooks/useTheme";
import { cn } from "../lib/format";

const tabs = [
  { to: "/", label: "Standings", icon: Trophy, end: true },
  { to: "/new", label: "Log Match", icon: PlusCircle, end: false },
  { to: "/log", label: "Match Log", icon: ListOrdered, end: false },
];

export function NavBar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-white/5 dark:bg-surface-dark/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-400 to-accent-600 text-white shadow-glow">
              <Trophy size={15} strokeWidth={2.5} />
            </div>
            <span className="font-display text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Rally
            </span>
          </div>

          <nav className="hidden items-center gap-1 md:flex">
            {tabs.map((tab) => (
              <NavLink
                key={tab.to}
                to={tab.to}
                end={tab.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition",
                    isActive
                      ? "bg-accent-50 text-accent-700 dark:bg-accent-400/10 dark:text-accent-300"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-200"
                  )
                }
              >
                <tab.icon size={16} strokeWidth={2.25} />
                {tab.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <a
              href="/leaderboard"
              target="_blank"
              rel="noreferrer"
              title="Big screen leaderboard"
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:flex dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-200"
            >
              <Monitor size={17} />
            </a>
            <a
              href="/api/export/standings.csv"
              title="Export standings CSV"
              className="hidden h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 sm:flex dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-200"
            >
              <Download size={16} />
            </a>
            <button
              onClick={toggleTheme}
              title="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-slate-200"
            >
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/70 bg-white/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)] md:hidden dark:border-white/5 dark:bg-surface-dark/90"
        aria-label="Primary"
      >
        <div className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                cn(
                  "flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold transition",
                  isActive
                    ? "text-accent-600 dark:text-accent-400"
                    : "text-slate-400 dark:text-slate-500"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  {tab.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
}
