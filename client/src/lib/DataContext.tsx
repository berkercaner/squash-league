import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api } from "./api";
import type { Player, StandingEntry } from "./types";

interface DataContextValue {
  players: Player[];
  standings: StandingEntry[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [standings, setStandings] = useState<StandingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const [p, s] = await Promise.all([api.getPlayers(), api.getStandings()]);
      setPlayers(p);
      setStandings(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <DataContext.Provider value={{ players, standings, loading, error, refresh }}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
