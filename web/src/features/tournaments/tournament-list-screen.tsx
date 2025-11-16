import type { ReactElement } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { TournamentSummary } from '../../lib/domain/types'
import { listStoredTournamentSummaries } from '../persistence/local-storage-adapter'
import { useTournamentSelection } from './use-tournament-selection'
import { PlayerListPanel } from '../players/player-list-panel'
import { PlayerStatsPanel } from '../ratings/player-stats-panel'
import { TournamentSettingsPanel } from './tournament-settings-panel'
import { importTournamentFromJson } from './import-tournament'
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
  const [tournaments, setTournaments] = useState<TournamentSummary[]>(() =>
    listStoredTournamentSummaries(),
  )
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importText, setImportText] = useState('')
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { selectTournament, hasSelection } = useTournamentSelection()

  const hasTournaments = tournaments.length > 0

  const handleImport = (): void => {
    const trimmed = importText.trim()

    setImportStatus(null)
    setImportError(null)

    if (!trimmed) {
      setImportError('Veuillez coller un JSON de tournoi avant d\'importer.')
      return
    }

    try {
      const imported = importTournamentFromJson(trimmed)
      setTournaments(listStoredTournamentSummaries())
      selectTournament(imported.id)
      setImportStatus('Tournoi importé avec succès.')
      setIsImportOpen(false)
      setImportText('')
    } catch (unknownError) {
      console.error(unknownError)

      const message =
        unknownError instanceof Error && unknownError.message
          ? unknownError.message
          : "Impossible d'importer le tournoi."

      setImportError(message)
    }
  }

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
            onClick={() => navigate('/history')}
          >
            Historique
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!hasSelection}
            onClick={() => navigate('/matchmaking')}
          >
            Matchmaking
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!hasSelection}
            onClick={() => navigate('/leaderboard')}
          >
            Classement
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={!hasSelection}
            onClick={() => navigate('/games/new')}
          >
            Nouvelle partie
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsImportOpen((prev) => !prev)
              setImportStatus(null)
              setImportError(null)
            }}
          >
            Importer un tournoi
          </Button>
          <Button type="button" onClick={() => navigate('/tournaments/new')}>
            + Nouveau tournoi
          </Button>
        </div>
      </div>

      {isImportOpen ? (
        <Card className="border border-dashed border-slate-700">
          <CardHeader>
            <CardTitle>Importer un tournoi</CardTitle>
            <CardDescription>
              Collez ici le JSON d&apos;un tournoi exporté. Si un tournoi avec le même id existe
              déjà, il sera écrasé.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            {importStatus ? (
              <p className="text-emerald-400">{importStatus}</p>
            ) : null}
            {importError ? <p className="text-red-400">{importError}</p> : null}

            <textarea
              className="min-h-[120px] w-full rounded-md border border-slate-700 bg-slate-950 p-2 font-mono text-slate-100"
              value={importText}
              onChange={(event) => setImportText(event.target.value)}
              placeholder={`{\n  "id": "mon-tournoi",\n  "name": "Mon tournoi",\n  ...\n}`}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsImportOpen(false)
                  setImportText('')
                  setImportStatus(null)
                  setImportError(null)
                }}
              >
                Annuler
              </Button>
              <Button type="button" variant="outline" onClick={handleImport}>
                Importer
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

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
          <TournamentSettingsPanel />
        </div>
      </div>
    </div>
  )
}
