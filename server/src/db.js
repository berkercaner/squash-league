import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, "squash-league.sqlite");
export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    nickname TEXT,
    color TEXT NOT NULL DEFAULT '#22d3ee',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  );

  CREATE TABLE IF NOT EXISTS matches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    player2_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    winner_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    played_at TEXT NOT NULL,
    games TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    CHECK (player1_id != player2_id),
    CHECK (winner_id = player1_id OR winner_id = player2_id)
  );

  CREATE INDEX IF NOT EXISTS idx_matches_player1 ON matches(player1_id);
  CREATE INDEX IF NOT EXISTS idx_matches_player2 ON matches(player2_id);
  CREATE INDEX IF NOT EXISTS idx_matches_played_at ON matches(played_at);
`);

export default db;
