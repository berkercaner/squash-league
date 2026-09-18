// Pure stat-computation helpers. Everything here is derived on the fly from
// the players + matches tables so that editing or deleting a match can never
// leave a stored "running total" out of sync — there is nothing stored to
// desync. For a league-sized dataset this is cheap to recompute per request.

/**
 * Parse the JSON `games` column into an array of { p1, p2 } game scores,
 * or null if no game-level score was recorded for this match.
 */
export function parseGames(match) {
  if (!match.games) return null;
  try {
    const parsed = JSON.parse(match.games);
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Build a per-player view of a single match: was it a win, who was the
 * opponent, what was the point margin (when game scores exist).
 */
function toPlayerMatch(match, playerId) {
  const isPlayer1 = match.player1_id === playerId;
  const opponentId = isPlayer1 ? match.player2_id : match.player1_id;
  const isWin = match.winner_id === playerId;
  const games = parseGames(match);

  let pointsFor = null;
  let pointsAgainst = null;
  if (games) {
    pointsFor = games.reduce((sum, g) => sum + (isPlayer1 ? g.p1 : g.p2), 0);
    pointsAgainst = games.reduce((sum, g) => sum + (isPlayer1 ? g.p2 : g.p1), 0);
  }

  return {
    matchId: match.id,
    playedAt: match.played_at,
    opponentId,
    isWin,
    games,
    pointsFor,
    pointsAgainst,
    margin: games ? pointsFor - pointsAgainst : null,
    notes: match.notes || null,
  };
}

/** All matches involving a player, chronological ascending. */
export function playerMatchesAsc(matches, playerId) {
  return matches
    .filter((m) => m.player1_id === playerId || m.player2_id === playerId)
    .sort((a, b) => a.played_at.localeCompare(b.played_at) || a.id - b.id)
    .map((m) => toPlayerMatch(m, playerId));
}

/**
 * Core per-player aggregate: score, wins/losses, streaks, cumulative score
 * series (for trending charts), recent form, and peak score ever reached.
 */
export function computePlayerAggregate(matches, playerId) {
  const asc = playerMatchesAsc(matches, playerId);

  let score = 0;
  let wins = 0;
  let losses = 0;
  let peakScore = 0;
  let runCurrentType = null; // 'W' | 'L'
  let runCurrentLen = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  const series = []; // { playedAt, score, matchId }
  const form = []; // 'W' | 'L' chronological ascending

  for (const pm of asc) {
    if (pm.isWin) {
      score += 1;
      wins += 1;
    } else {
      score -= 1;
      losses += 1;
    }
    peakScore = Math.max(peakScore, score);
    series.push({ playedAt: pm.playedAt, score, matchId: pm.matchId });

    const type = pm.isWin ? "W" : "L";
    form.push(type);
    if (type === runCurrentType) {
      runCurrentLen += 1;
    } else {
      runCurrentType = type;
      runCurrentLen = 1;
    }
    if (type === "W") longestWinStreak = Math.max(longestWinStreak, runCurrentLen);
    else longestLossStreak = Math.max(longestLossStreak, runCurrentLen);
  }

  const totalMatches = wins + losses;
  const winPct = totalMatches ? wins / totalMatches : 0;

  // Average margin of victory, only over matches with recorded game scores.
  const winMarginsWithData = asc.filter((pm) => pm.isWin && pm.margin != null).map((pm) => pm.margin);
  const avgMarginOfVictory = winMarginsWithData.length
    ? winMarginsWithData.reduce((s, m) => s + m, 0) / winMarginsWithData.length
    : null;

  return {
    playerId,
    score,
    wins,
    losses,
    totalMatches,
    winPct,
    currentStreak: { type: runCurrentType, length: runCurrentType ? runCurrentLen : 0 },
    longestWinStreak,
    longestLossStreak,
    series,
    recentForm: form.slice(-10).reverse(), // most recent first
    peakScore,
    avgMarginOfVictory,
    matchesAsc: asc,
  };
}

/** Head-to-head breakdown for a player against every opponent they've faced. */
export function computeHeadToHead(asc, playersById) {
  const byOpponent = new Map();
  for (const pm of asc) {
    if (!byOpponent.has(pm.opponentId)) {
      byOpponent.set(pm.opponentId, { opponentId: pm.opponentId, wins: 0, losses: 0 });
    }
    const entry = byOpponent.get(pm.opponentId);
    if (pm.isWin) entry.wins += 1;
    else entry.losses += 1;
  }

  const list = Array.from(byOpponent.values()).map((e) => ({
    ...e,
    opponent: playersById.get(e.opponentId) || null,
    matches: e.wins + e.losses,
    net: e.wins - e.losses,
  }));

  list.sort((a, b) => b.net - a.net || b.matches - a.matches);

  const favorite = list.length && list[0].net > 0 ? list[0] : null;
  const nemesisCandidates = [...list].sort((a, b) => a.net - b.net || b.losses - a.losses);
  const nemesis = nemesisCandidates.length && nemesisCandidates[0].net < 0 ? nemesisCandidates[0] : null;

  return { list, favorite, nemesis };
}

/**
 * Standings comparator.
 *
 * Sort order (explained to the user in the README):
 *   1. Total score, descending (wins minus losses) — the headline number.
 *   2. Win percentage, descending — rewards efficiency over sheer volume
 *      when two players are level on score.
 *   3. Head-to-head record between the tied pair, if they've played each
 *      other — the most intuitive tiebreaker for a small league where
 *      everyone plays everyone.
 *   4. Total wins, descending, then name — final deterministic fallback.
 */
export function rankPlayers(aggregates, matchesByPairKey) {
  const arr = [...aggregates];
  arr.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.winPct !== a.winPct) return b.winPct - a.winPct;

    const key = pairKey(a.playerId, b.playerId);
    const h2h = matchesByPairKey.get(key);
    if (h2h) {
      const aWins = h2h.filter((m) => m.winnerId === a.playerId).length;
      const bWins = h2h.filter((m) => m.winnerId === b.playerId).length;
      if (aWins !== bWins) return bWins - aWins;
    }

    if (b.wins !== a.wins) return b.wins - a.wins;
    return a.playerName.localeCompare(b.playerName);
  });
  return arr.map((a, i) => ({ ...a, rank: i + 1 }));
}

export function pairKey(id1, id2) {
  return [id1, id2].sort((x, y) => x - y).join(":");
}

export function buildPairIndex(matches) {
  const index = new Map();
  for (const m of matches) {
    const key = pairKey(m.player1_id, m.player2_id);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push({ winnerId: m.winner_id, playedAt: m.played_at });
  }
  return index;
}
