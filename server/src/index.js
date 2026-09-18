import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { db } from "./db.js";
import { colorForIndex } from "./colors.js";
import {
  computePlayerAggregate,
  computeHeadToHead,
  rankPlayers,
  buildPairIndex,
} from "./stats.js";
import {
  ValidationError,
  requireString,
  optionalString,
  requireId,
  validateGames,
  validatePlayedAt,
} from "./validation.js";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function getAllPlayers() {
  return db.prepare("SELECT * FROM players ORDER BY id ASC").all();
}

function getAllMatches() {
  return db.prepare("SELECT * FROM matches ORDER BY played_at ASC, id ASC").all();
}

function playerRowToDto(row, index) {
  return {
    id: row.id,
    name: row.name,
    nickname: row.nickname,
    color: row.color || colorForIndex(index),
    createdAt: row.created_at,
  };
}

function matchRowToDto(row, playersById) {
  return {
    id: row.id,
    player1: playersById.get(row.player1_id) || null,
    player2: playersById.get(row.player2_id) || null,
    winnerId: row.winner_id,
    loserId: row.winner_id === row.player1_id ? row.player2_id : row.player1_id,
    playedAt: row.played_at,
    games: row.games ? JSON.parse(row.games) : null,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getPlayersById() {
  const players = getAllPlayers();
  const map = new Map();
  players.forEach((p, i) => map.set(p.id, playerRowToDto(p, i)));
  return map;
}

function buildStandings() {
  const players = getAllPlayers();
  const matches = getAllMatches();
  const playersById = getPlayersById();
  const pairIndex = buildPairIndex(matches);

  const aggregates = players.map((p, i) => {
    const agg = computePlayerAggregate(matches, p.id);
    const dto = playersById.get(p.id);
    return {
      playerId: p.id,
      player: dto,
      playerName: p.name,
      score: agg.score,
      wins: agg.wins,
      losses: agg.losses,
      totalMatches: agg.totalMatches,
      winPct: agg.winPct,
      currentStreak: agg.currentStreak,
      recentForm: agg.recentForm,
      series: agg.series,
      peakScore: agg.peakScore,
    };
  });

  return rankPlayers(aggregates, pairIndex);
}

function notFound(res, message) {
  return res.status(404).json({ error: message });
}

// ---------------------------------------------------------------------------
// players
// ---------------------------------------------------------------------------

app.get("/api/players", (req, res) => {
  const players = getAllPlayers();
  res.json(players.map(playerRowToDto));
});

app.post("/api/players", (req, res) => {
  try {
    const name = requireString(req.body.name, "name", { max: 60 });
    const nickname = optionalString(req.body.nickname, "nickname", { max: 40 });

    const existing = db.prepare("SELECT id FROM players WHERE lower(name) = lower(?)").get(name);
    if (existing) {
      throw new ValidationError("A player with that name already exists.", "name");
    }

    const count = db.prepare("SELECT COUNT(*) as c FROM players").get().c;
    const color = colorForIndex(count);

    const info = db
      .prepare("INSERT INTO players (name, nickname, color) VALUES (?, ?, ?)")
      .run(name, nickname, color);

    const row = db.prepare("SELECT * FROM players WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(playerRowToDto(row, count));
  } catch (err) {
    handleError(res, err);
  }
});

app.get("/api/players/:id", (req, res) => {
  const id = Number(req.params.id);
  const row = db.prepare("SELECT * FROM players WHERE id = ?").get(id);
  if (!row) return notFound(res, "Player not found.");
  const players = getAllPlayers();
  const index = players.findIndex((p) => p.id === id);
  res.json(playerRowToDto(row, index));
});

app.get("/api/players/:id/detail", (req, res) => {
  const id = Number(req.params.id);
  const playerRow = db.prepare("SELECT * FROM players WHERE id = ?").get(id);
  if (!playerRow) return notFound(res, "Player not found.");

  const players = getAllPlayers();
  const index = players.findIndex((p) => p.id === id);
  const player = playerRowToDto(playerRow, index);

  const matches = getAllMatches();
  const playersById = getPlayersById();
  const agg = computePlayerAggregate(matches, id);
  const h2h = computeHeadToHead(agg.matchesAsc, playersById);

  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 15));
  const historyDesc = [...agg.matchesAsc].reverse();
  const total = historyDesc.length;
  const start = (page - 1) * pageSize;
  const pageItems = historyDesc.slice(start, start + pageSize).map((pm) => ({
    matchId: pm.matchId,
    playedAt: pm.playedAt,
    opponent: playersById.get(pm.opponentId) || null,
    isWin: pm.isWin,
    games: pm.games,
    pointsFor: pm.pointsFor,
    pointsAgainst: pm.pointsAgainst,
    margin: pm.margin,
    notes: pm.notes,
  }));

  // rank + score context relative to the field, for the header stat row
  const standings = buildStandings();
  const standingEntry = standings.find((s) => s.playerId === id);

  res.json({
    player,
    rank: standingEntry ? standingEntry.rank : null,
    playerCount: standings.length,
    stats: {
      score: agg.score,
      wins: agg.wins,
      losses: agg.losses,
      totalMatches: agg.totalMatches,
      winPct: agg.winPct,
      currentStreak: agg.currentStreak,
      longestWinStreak: agg.longestWinStreak,
      longestLossStreak: agg.longestLossStreak,
      peakScore: agg.peakScore,
      avgMarginOfVictory: agg.avgMarginOfVictory,
      recentForm: agg.recentForm,
    },
    trending: agg.series,
    headToHead: {
      list: h2h.list,
      favorite: h2h.favorite,
      nemesis: h2h.nemesis,
    },
    history: {
      items: pageItems,
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  });
});

// ---------------------------------------------------------------------------
// standings
// ---------------------------------------------------------------------------

app.get("/api/standings", (req, res) => {
  res.json(buildStandings());
});

// ---------------------------------------------------------------------------
// matches
// ---------------------------------------------------------------------------

app.get("/api/matches", (req, res) => {
  const { playerId, from, to } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(200, Math.max(1, Number(req.query.pageSize) || 20));

  let matches = getAllMatches().reverse(); // desc

  if (playerId) {
    const pid = Number(playerId);
    matches = matches.filter((m) => m.player1_id === pid || m.player2_id === pid);
  }
  if (from) {
    const fromTime = new Date(from).getTime();
    if (!Number.isNaN(fromTime)) matches = matches.filter((m) => new Date(m.played_at).getTime() >= fromTime);
  }
  if (to) {
    const toTime = new Date(to).getTime();
    if (!Number.isNaN(toTime)) matches = matches.filter((m) => new Date(m.played_at).getTime() <= toTime);
  }

  const playersById = getPlayersById();
  const total = matches.length;
  const start = (page - 1) * pageSize;
  const items = matches.slice(start, start + pageSize).map((m) => matchRowToDto(m, playersById));

  res.json({
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  });
});

function readMatchBody(body) {
  const player1Id = requireId(body.player1Id, "player1Id");
  const player2Id = requireId(body.player2Id, "player2Id");
  if (player1Id === player2Id) {
    throw new ValidationError("A player can't play a match against themselves.", "player2Id");
  }
  const winnerId = requireId(body.winnerId, "winnerId");
  if (winnerId !== player1Id && winnerId !== player2Id) {
    throw new ValidationError("winnerId must be one of the two players.", "winnerId");
  }

  const p1 = db.prepare("SELECT id FROM players WHERE id = ?").get(player1Id);
  const p2 = db.prepare("SELECT id FROM players WHERE id = ?").get(player2Id);
  if (!p1 || !p2) throw new ValidationError("One or both players could not be found.", "player1Id");

  const playedAt = validatePlayedAt(body.playedAt);
  const games = validateGames(body.games);
  const notes = optionalString(body.notes, "notes", { max: 300 });

  return { player1Id, player2Id, winnerId, playedAt, games, notes };
}

app.post("/api/matches", (req, res) => {
  try {
    const { player1Id, player2Id, winnerId, playedAt, games, notes } = readMatchBody(req.body);

    const info = db
      .prepare(
        `INSERT INTO matches (player1_id, player2_id, winner_id, played_at, games, notes)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(player1Id, player2Id, winnerId, playedAt, games ? JSON.stringify(games) : null, notes);

    const row = db.prepare("SELECT * FROM matches WHERE id = ?").get(info.lastInsertRowid);
    res.status(201).json(matchRowToDto(row, getPlayersById()));
  } catch (err) {
    handleError(res, err);
  }
});

app.put("/api/matches/:id", (req, res) => {
  try {
    const id = Number(req.params.id);
    const existing = db.prepare("SELECT * FROM matches WHERE id = ?").get(id);
    if (!existing) return notFound(res, "Match not found.");

    const { player1Id, player2Id, winnerId, playedAt, games, notes } = readMatchBody(req.body);

    db.prepare(
      `UPDATE matches
       SET player1_id = ?, player2_id = ?, winner_id = ?, played_at = ?, games = ?, notes = ?,
           updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = ?`
    ).run(player1Id, player2Id, winnerId, playedAt, games ? JSON.stringify(games) : null, notes, id);

    const row = db.prepare("SELECT * FROM matches WHERE id = ?").get(id);
    res.json(matchRowToDto(row, getPlayersById()));
  } catch (err) {
    handleError(res, err);
  }
});

app.delete("/api/matches/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM matches WHERE id = ?").get(id);
  if (!existing) return notFound(res, "Match not found.");
  db.prepare("DELETE FROM matches WHERE id = ?").run(id);
  res.status(204).end();
});

// ---------------------------------------------------------------------------
// CSV export
// ---------------------------------------------------------------------------

function toCsvValue(v) {
  if (v == null) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

app.get("/api/export/standings.csv", (req, res) => {
  const standings = buildStandings();
  const header = ["Rank", "Player", "Score", "Wins", "Losses", "Matches", "Win %", "Current Streak"];
  const rows = standings.map((s) => [
    s.rank,
    s.playerName,
    s.score,
    s.wins,
    s.losses,
    s.totalMatches,
    (s.winPct * 100).toFixed(1),
    s.currentStreak.type ? `${s.currentStreak.type}${s.currentStreak.length}` : "-",
  ]);
  const csv = [header, ...rows].map((r) => r.map(toCsvValue).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=standings.csv");
  res.send(csv);
});

app.get("/api/export/matches.csv", (req, res) => {
  const playersById = getPlayersById();
  const matches = getAllMatches().reverse();
  const header = ["Date", "Player 1", "Player 2", "Winner", "Score", "Notes"];
  const rows = matches.map((m) => {
    const games = m.games ? JSON.parse(m.games) : null;
    const scoreStr = games ? games.map((g) => `${g.p1}-${g.p2}`).join(", ") : "";
    const winnerName = playersById.get(m.winner_id)?.name || "";
    return [
      m.played_at,
      playersById.get(m.player1_id)?.name || "",
      playersById.get(m.player2_id)?.name || "",
      winnerName,
      scoreStr,
      m.notes || "",
    ];
  });
  const csv = [header, ...rows].map((r) => r.map(toCsvValue).join(",")).join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=match-history.csv");
  res.send(csv);
});

// ---------------------------------------------------------------------------
// misc
// ---------------------------------------------------------------------------

app.get("/api/health", (req, res) => res.json({ ok: true }));

function handleError(res, err) {
  if (err instanceof ValidationError) {
    return res.status(err.status).json({ error: err.message, field: err.field });
  }
  console.error(err);
  return res.status(500).json({ error: "Something went wrong on the server." });
}

app.use((err, req, res, next) => {
  handleError(res, err);
});

// ---------------------------------------------------------------------------
// serve the built frontend in production, if it has been built
// ---------------------------------------------------------------------------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, "..", "..", "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Squash league API listening on http://localhost:${PORT}`);
});
