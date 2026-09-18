export interface Player {
  id: number;
  name: string;
  nickname: string | null;
  color: string;
  createdAt: string;
}

export interface Streak {
  type: "W" | "L" | null;
  length: number;
}

export interface SeriesPoint {
  playedAt: string;
  score: number;
  matchId: number;
}

export interface StandingEntry {
  rank: number;
  playerId: number;
  player: Player;
  playerName: string;
  score: number;
  wins: number;
  losses: number;
  totalMatches: number;
  winPct: number;
  currentStreak: Streak;
  recentForm: ("W" | "L")[];
  series: SeriesPoint[];
  peakScore: number;
}

export interface GameScore {
  p1: number;
  p2: number;
}

export interface Match {
  id: number;
  player1: Player | null;
  player2: Player | null;
  winnerId: number;
  loserId: number;
  playedAt: string;
  games: GameScore[] | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedMatches {
  items: Match[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface HeadToHeadEntry {
  opponentId: number;
  opponent: Player | null;
  wins: number;
  losses: number;
  matches: number;
  net: number;
}

export interface HistoryItem {
  matchId: number;
  playedAt: string;
  opponent: Player | null;
  isWin: boolean;
  games: GameScore[] | null;
  pointsFor: number | null;
  pointsAgainst: number | null;
  margin: number | null;
  notes: string | null;
}

export interface PlayerDetail {
  player: Player;
  rank: number | null;
  playerCount: number;
  stats: {
    score: number;
    wins: number;
    losses: number;
    totalMatches: number;
    winPct: number;
    currentStreak: Streak;
    longestWinStreak: number;
    longestLossStreak: number;
    peakScore: number;
    avgMarginOfVictory: number | null;
    recentForm: ("W" | "L")[];
  };
  trending: SeriesPoint[];
  headToHead: {
    list: HeadToHeadEntry[];
    favorite: HeadToHeadEntry | null;
    nemesis: HeadToHeadEntry | null;
  };
  history: {
    items: HistoryItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  error: string;
  field?: string;
}
