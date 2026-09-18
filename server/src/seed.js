// Resets the database to a clean slate: your real roster, zero matches,
// zero score for everyone. Safe to re-run, but note that re-running it
// WIPES all matches — only run this to reset back to a blank league, not
// as part of normal use once you've started logging real matches.
import { db } from "./db.js";
import { colorForIndex } from "./colors.js";

// Add, remove, or edit players here — this is the only thing you should
// need to touch. No "skill" rating, no simulated matches: everyone starts
// at 0 with a clean history. Every stat you'll see builds up from the
// matches you actually log in the app from now on.
const PLAYERS = [
  { name: "Berker", nickname: null },
  { name: "Tyna", nickname: null },
  { name: "Burak", nickname: null },
  { name: "Gokhan", nickname: null},
  { name: "Justa", nickname: null },
];

function resetTables() {
  db.exec("DELETE FROM matches; DELETE FROM sqlite_sequence WHERE name='matches';");
  db.exec("DELETE FROM players; DELETE FROM sqlite_sequence WHERE name='players';");
}

function insertPlayers() {
  const stmt = db.prepare("INSERT INTO players (name, nickname, color) VALUES (?, ?, ?)");
  PLAYERS.forEach((p, i) => stmt.run(p.name, p.nickname, colorForIndex(i)));
}

function run() {
  resetTables();
  insertPlayers();
  console.log(`Reset complete: ${PLAYERS.length} players added, 0 matches. Everyone starts at 0.`);
}

run();