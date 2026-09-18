import { Route, Routes } from "react-router-dom";
import { NavBar } from "./components/NavBar";
import { Standings } from "./pages/Standings";
import { PlayerDetail } from "./pages/PlayerDetail";
import { MatchEntry } from "./pages/MatchEntry";
import { MatchLog } from "./pages/MatchLog";
import { Leaderboard } from "./pages/Leaderboard";

export default function App() {
  return (
    <Routes>
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen">
            <NavBar />
            <main className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-6 sm:pt-8 md:pb-16">
              <Routes>
                <Route path="/" element={<Standings />} />
                <Route path="/players/:id" element={<PlayerDetail />} />
                <Route path="/new" element={<MatchEntry />} />
                <Route path="/log" element={<MatchLog />} />
              </Routes>
            </main>
          </div>
        }
      />
    </Routes>
  );
}
