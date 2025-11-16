import type { ReactElement } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { TournamentListScreen } from '../../features/tournaments/tournament-list-screen'
import { CreateTournamentWizard } from '../../features/tournaments/create-tournament-wizard'
import { GameResultScreen } from '../../features/games/game-result-screen'
import { LeaderboardScreen } from '../../features/ratings/leaderboard-screen'
import { MatchmakingScreen } from '../../features/matchmaking/matchmaking-screen'

export function AppRouter(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TournamentListScreen />} />
        <Route path="/tournaments/new" element={<CreateTournamentWizard />} />
        <Route path="/games/new" element={<GameResultScreen />} />
        <Route path="/leaderboard" element={<LeaderboardScreen />} />
        <Route path="/matchmaking" element={<MatchmakingScreen />} />
      </Routes>
    </BrowserRouter>
  )
}
