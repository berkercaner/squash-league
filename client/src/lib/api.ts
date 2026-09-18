import type {
  Player,
  StandingEntry,
  Match,
  PaginatedMatches,
  PlayerDetail,
  GameScore,
} from "./types";

export class ApiRequestError extends Error {
  field?: string;
  constructor(message: string, field?: string) {
    super(message);
    this.field = field;
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (res.status === 204) return undefined as T;
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json() : await res.text();
  if (!res.ok) {
    const message = isJson && body?.error ? body.error : "Something went wrong.";
    throw new ApiRequestError(message, isJson ? body?.field : undefined);
  }
  return body as T;
}

export const api = {
  getPlayers: () => request<Player[]>("/players"),
  createPlayer: (data: { name: string; nickname?: string | null }) =>
    request<Player>("/players", { method: "POST", body: JSON.stringify(data) }),

  getStandings: () => request<StandingEntry[]>("/standings"),

  getPlayerDetail: (id: number, page = 1, pageSize = 15) =>
    request<PlayerDetail>(`/players/${id}/detail?page=${page}&pageSize=${pageSize}`),

  getMatches: (params: { playerId?: number; from?: string; to?: string; page?: number; pageSize?: number } = {}) => {
    const q = new URLSearchParams();
    if (params.playerId) q.set("playerId", String(params.playerId));
    if (params.from) q.set("from", params.from);
    if (params.to) q.set("to", params.to);
    q.set("page", String(params.page ?? 1));
    q.set("pageSize", String(params.pageSize ?? 20));
    return request<PaginatedMatches>(`/matches?${q.toString()}`);
  },

  createMatch: (data: {
    player1Id: number;
    player2Id: number;
    winnerId: number;
    playedAt?: string;
    games?: GameScore[] | null;
    notes?: string | null;
  }) => request<Match>("/matches", { method: "POST", body: JSON.stringify(data) }),

  updateMatch: (
    id: number,
    data: {
      player1Id: number;
      player2Id: number;
      winnerId: number;
      playedAt?: string;
      games?: GameScore[] | null;
      notes?: string | null;
    }
  ) => request<Match>(`/matches/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteMatch: (id: number) => request<void>(`/matches/${id}`, { method: "DELETE" }),
};
