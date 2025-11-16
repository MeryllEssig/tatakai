import type { ReactElement } from 'react'
import { useState } from 'react'
import { useAtomValue, useSetAtom } from 'jotai/react'
import type { GameData } from '../../lib/domain/types'
import { gameDataAtom } from '../../state/atoms'
import { exportTournamentToClipboard } from './export-tournament'
import { createInitialRating } from '../../lib/openskill/ratings'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/components/card'
import { Button } from '../../ui/components/button'

function resetTournamentGameData(gameData: GameData): GameData {
  const updatedAt = new Date().toISOString()

  const resetPlayers = gameData.players.map((player) => ({
    ...player,
    rating: createInitialRating(gameData.ratingConfig),
    benchStreak: 0,
    gamesPlayed: 0,
  }))

  return {
    ...gameData,
    updatedAt,
    players: resetPlayers,
    games: [],
  }
}

export function TournamentSettingsPanel(): ReactElement {
  const gameData = useAtomValue(gameDataAtom)
  const setGameData = useSetAtom(gameDataAtom)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!gameData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Parametres du tournoi</CardTitle>
          <CardDescription>
            Selectionnez un tournoi pour exporter ou reinitialiser ses donnees.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const handleExport = async () => {
    setStatusMessage(null)
    setErrorMessage(null)

    try {
      await exportTournamentToClipboard(gameData)
      setStatusMessage('Tournoi exporte vers le presse-papiers.')
    } catch (unknownError) {
      console.error(unknownError)
      setErrorMessage(
        "Impossible d'exporter le tournoi. Verifiez les autorisations du presse-papiers.",
      )
    }
  }

  const handleReset = () => {
    const confirmed = window.confirm(
      'Reinitialiser ce tournoi ? Toutes les parties seront supprimees et les ratings remis a zero.',
    )

    if (!confirmed) return

    setStatusMessage(null)
    setErrorMessage(null)

    const updated = resetTournamentGameData(gameData)
    setGameData(updated)
    setStatusMessage('Tournoi reinitialise. Toutes les parties ont ete supprimees.')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parametres du tournoi</CardTitle>
        <CardDescription>
          Exportez les donnees ou reinitialisez ce tournoi.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 text-sm">
        {statusMessage ? <p className="text-emerald-400">{statusMessage}</p> : null}
        {errorMessage ? <p className="text-red-400">{errorMessage}</p> : null}

        <div className="flex flex-col gap-2">
          <Button type="button" variant="outline" onClick={handleExport}>
            Exporter le tournoi (JSON)
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            Reinitialiser le tournoi
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
