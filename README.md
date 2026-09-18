# Rally — Squash League Scoreboard

A polished, mobile-first web app for tracking a squash league's scoreboard, standings, and player stats. Built with a React + TypeScript frontend and a Node/Express + SQLite backend, both running entirely on your own machine — no account, no cloud, no internet connection required after installation.

## Stack

- **Backend:** Node.js + Express + [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) — a real SQLite database file on disk (`server/data/squash-league.sqlite`), so your data survives restarts.
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS, [Recharts](https://recharts.org/) for the trend charts, [Framer Motion](https://www.framer.com/motion/) for the micro-interactions, and [Lucide](https://lucide.dev/) for icons.
- All stats (standings, streaks, head-to-head, trends) are computed on the fly from the raw match log, so editing or deleting a match always recalculates everything correctly — there's no stored running total that can drift out of sync.

## Requirements

- Node.js 18 or newer (Node 20+ recommended). Check with `node --version`.

## Running it locally

From the project root:

```bash
# 1. Install dependencies for both the server and the client
npm run install:all

# 2. Load sample data (8 players, ~170 matches) so there's something to look at immediately
npm run seed

# 3. Start both the API server (port 4000) and the frontend dev server (port 5173)
npm run dev
```

Then open **http://localhost:5173** in your browser.

The frontend dev server proxies `/api/*` requests to the backend, so you only ever need to visit port 5173 during development. Leave both processes running — `npm run dev` starts them together and labels their output `SERVER` / `CLIENT` in your terminal. Press `Ctrl+C` to stop both.

### Re-seeding / resetting data

`npm run seed` always wipes existing players and matches and inserts a fresh sample league. Run it again any time you want to reset back to a clean demo state. To start completely empty instead, just delete `server/data/squash-league.sqlite` and restart the server — it will recreate an empty database on boot, and the app's empty states will guide you through adding your first players and match.

### Running as a single production process

If you'd rather run one process instead of two:

```bash
npm run build      # builds the frontend into client/dist
npm start           # starts the Express server, which now also serves client/dist
```

Then visit **http://localhost:4000** — the API and the UI are served from the same origin.

## Project structure

```
squash-league-app/
├── server/                 # Express + SQLite API
│   ├── src/
│   │   ├── db.js           # schema + connection
│   │   ├── stats.js        # standings/streaks/head-to-head computation
│   │   ├── validation.js   # request validation
│   │   ├── colors.js       # auto-assigned player colors
│   │   ├── seed.js         # sample data generator
│   │   └── index.js        # routes
│   └── data/                # squash-league.sqlite lives here (created on first run)
├── client/                 # React + TypeScript + Vite frontend
│   └── src/
│       ├── pages/          # Standings, PlayerDetail, MatchEntry, MatchLog, Leaderboard
│       ├── components/     # reusable UI pieces (cards, charts, modals, nav)
│       ├── lib/             # API client, shared types, contexts
│       └── hooks/           # theme hook
└── package.json             # root scripts (install:all, seed, dev, build, start)
```

## Feature tour

- **Standings** (`/`, the home page) — the full ranked table, sorted by score. Rank #1 gets a gold crown treatment and a subtle highlighted row; ranks 2–3 get medals. Each row shows a live sparkline of the player's score history, their W–L record, matches played, a win-% bar, and a current-streak badge with recent form dots. On phones this collapses into a stack of cards instead of a horizontally-scrolling table. Rows smoothly reorder (via Framer Motion layout animation) whenever a new match changes the standings.
- **Player Detail** (`/players/:id`) — click any row to get:
  - Full reverse-chronological, paginated match history.
  - A trend chart of score over time, plus a row of W/L dots for recent form.
  - **Favorite Opponent** and **Nemesis** cards (see "How favorite/nemesis are picked" below), and a complete head-to-head breakdown against every opponent they've played.
  - Current streak, longest win/loss streak ever, total matches, win %, peak score ever reached, and average margin of victory (from recorded game scores).
- **Log Match** (`/new`) — pick Player 1 and Player 2 from a roster of pill buttons, tap the winner, optionally back-date it, optionally add a game-by-game score line (supports any best-of-N, not just single-game), add a short note, and submit. A confirmation banner and toast appear immediately, and the standings update everywhere in the app instantly.
- **Match Log** (`/log`) — the global reverse-chronological feed of every match, filterable by player and date range, with inline **edit** and **delete** for fixing data-entry mistakes. All stats recalculate automatically since nothing is cached — they're derived from the match table every time.
- **Big-screen leaderboard** (`/leaderboard`) — a large-type, dark, auto-refreshing (every 15s) view meant for a TV or monitor next to the court. Linked from the monitor icon in the header.
- **CSV export** — the download icon in the header (and the Export button on the Match Log page) export `standings.csv` and `match-history.csv` respectively, straight from the API (`/api/export/standings.csv`, `/api/export/matches.csv`).
- **Light/dark mode** — defaults to your system preference and can be toggled from the header (moon/sun icon); your choice is remembered.
- **Validation** — a player can't be logged against themselves, a match can't be created without a winner, and individual games can't end in a tie. Player names must be unique.

## How the stats are calculated

- **Score:** every win is **+1**, every loss is **−1**, summed across all of a player's matches. This is the number shown as their headline "score" and it's what standings are primarily ranked by.
- **Standings tie-break order**, when two or more players are level on score:
  1. **Win percentage**, descending — rewards efficiency (fewer losses for the same number of wins) over sheer volume.
  2. **Head-to-head record**, if the tied players have played each other directly — the most intuitive tiebreaker in a small league where everyone tends to play everyone.
  3. **Total wins**, descending, then **name**, alphabetically — a final deterministic fallback so the order is always stable.
- **Streaks:** a player's matches are walked in chronological order. The **current streak** is the run of consecutive identical results ending at their most recent match. **Longest win/loss streak** are the longest such runs anywhere in their history, not just the current one.
- **Peak score:** the highest value the player's running score ever reached, which can be higher than their current score if they've cooled off since.
- **Average margin of victory:** for matches where game scores were recorded, this is the average (own points scored − opponent points scored, summed across all games in the match) over the matches that player won. Matches logged without a score line are excluded from this average rather than counted as zero.
- **How favorite/nemesis are picked:** for every opponent a player has faced, we compute a net head-to-head score (wins − losses against that specific opponent). The **Favorite Opponent** is whichever opponent has the highest positive net (ties broken by most wins); the **Nemesis** is whichever has the lowest (most negative) net (ties broken by most losses against them). If a player has never had a losing head-to-head against anyone, "No nemesis yet" is shown instead of an arbitrary pick.

## Notes on the sample data

`npm run seed` generates 8 players with varying skill levels and roughly 170 matches spread over the last ~100 days (with some game-score detail on about 80% of matches, and some days skipped, to look like a real casual league rather than a uniform simulation). It's meant purely to make every page and chart meaningful the first time you open the app — feel free to wipe it (see "Re-seeding / resetting data" above) and start your real league from scratch.
