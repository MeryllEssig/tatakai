import { ArrowLeftOutlined } from '@ant-design/icons'
import { useSetAtom } from 'jotai/react'
import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Outlet, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { GameHistoryScreen } from '../../features/games/game-history-screen'
import { GameResultScreen } from '../../features/games/game-result-screen'
import { MatchmakingScreen } from '../../features/matchmaking/matchmaking-screen'
import { loadTournament } from '../../features/persistence/local-storage-adapter'
import { LeaderboardScreen } from '../../features/ratings/leaderboard-screen'
import { CreateTournamentWizard } from '../../features/tournaments/create-tournament-wizard'
import { TournamentListScreen } from '../../features/tournaments/tournament-list-screen'
import { TournamentSettingsPanel } from '../../features/tournaments/tournament-settings-panel'
import { currentTournamentIdAtom, gameDataAtom } from '../../state/atoms'
import { Button } from '../../ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/components/card'

function TournamentRouteGuard(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const setCurrentTournamentId = useSetAtom(currentTournamentIdAtom)
  const setGameData = useSetAtom(gameDataAtom)
  const tournament = id ? loadTournament(id) : null

  useEffect(() => {
    if (!id || !tournament) {
      setCurrentTournamentId(null)
      setGameData(null)
      return
    }

    setCurrentTournamentId(id)
    setGameData(tournament)
  }, [id, setCurrentTournamentId, setGameData, tournament])

  if (!id || !tournament) {
    return <TournamentNotFoundScreen />
  }

  return <Outlet />
}

function TournamentNotFoundScreen(): ReactElement {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Tournoi introuvable</CardTitle>
            <CardDescription>
              Le tournoi demandé n'existe pas ou n'est plus disponible. Retournez à la liste des
              tournois pour en sélectionner un autre.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-end">
            <Button
              type="button"
              aria-label="Retour à la liste des tournois"
              onClick={() => navigate('/')}
            >
              <ArrowLeftOutlined aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function TournamentSettingsRoute(): ReactElement {
  return (
    <div className="mx-auto max-w-4xl py-4">
      <TournamentSettingsPanel />
    </div>
  )
}

export function AppRouter(): ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TournamentListScreen />} />
        <Route path="/tournament/:id/*" element={<TournamentRouteGuard />}>
          <Route index element={<TournamentListScreen />} />
          <Route path="history" element={<GameHistoryScreen />} />
          <Route path="leaderboard" element={<LeaderboardScreen />} />
          <Route path="matchmaking" element={<MatchmakingScreen />} />
          <Route path="settings" element={<TournamentSettingsRoute />} />
          <Route path="new-game" element={<GameResultScreen />} />
        </Route>
        <Route path="/new-tournament" element={<CreateTournamentWizard />} />
      </Routes>
    </BrowserRouter>
  )
}
