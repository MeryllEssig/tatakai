import type { ReactElement } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TournamentSummary } from '../../lib/domain/types'
import { listStoredTournamentSummaries } from '../persistence/local-storage-adapter'
import { useTournamentSelection } from './use-tournament-selection'
import { PlayerListPanel } from '../players/player-list-panel'
import { PlayerStatsPanel } from '../ratings/player-stats-panel'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'
import { Button } from '../../ui/components/button'

function formatLastGameDate(value: string | null): string {
  if (!value) return 'Aucune'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Inconnue'
  return date.toLocaleString()
}

export function TournamentListScreen(): ReactElement {
  const [tournaments] = useState<TournamentSummary[]>(() =>
    listStoredTournamentSummaries(),
  )
  const navigate = useNavigate()
  const { selectTournament, hasSelection } = useTournamentSelection()

  const hasTournaments = tournaments.length > 0

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-semibold">Tournois</h2>
          <p className="text-sm text-slate-300">
            Gérez vos tournois locaux. Créez un tournoi puis ajoutez des joueurs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={!hasSelection}
            onClick={() => navigate('/games/new')}
          >
            Nouvelle partie
          </Button>
          <Button type="button" onClick={() => navigate('/tournaments/new')}>
            + Nouveau tournoi
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div>
          {!hasTournaments ? (
            <Card>
              <CardHeader>
                <CardTitle>Aucun tournoi pour le moment</CardTitle>
                <CardDescription>
                  Créez votre premier tournoi pour commencer à enregistrer des parties.
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {tournaments.map((tournament) => (
                <Card
                  key={tournament.id}
                  className="cursor-pointer"
                  onClick={() => selectTournament(tournament.id)}
                >
                  <CardHeader>
                    <CardTitle>{tournament.name}</CardTitle>
                    <CardDescription>
                      {tournament.playerCount} joueur
                      {tournament.playerCount > 1 ? 's' : ''} · {tournament.gameCount} partie
                      {tournament.gameCount > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between text-xs text-slate-400">
                    <span>Dernière partie : {formatLastGameDate(tournament.lastGameDate)}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <PlayerListPanel />
          <PlayerStatsPanel />
        </div>
      </div>
    </div>
  )
}
